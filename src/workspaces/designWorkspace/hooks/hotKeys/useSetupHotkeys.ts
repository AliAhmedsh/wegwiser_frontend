import { showToast } from '@/lib/utils/toast';
import { useToolStore } from '@/workspaces/designWorkspace/store/useTool.store';
import { useCallback, useRef } from 'react';

export const useKanvasHotkeys = () => {
  const { setSelectedTool,isHotKeysDisabled } = useToolStore();
  const listenerRef = useRef<(e: KeyboardEvent) => void | undefined>(undefined);
  const shiftListenerRef = useRef<(e: KeyboardEvent) => void | undefined>(undefined)
  const shiftPressed = useRef<boolean>(false)
  const ctrlListenerRef = useRef<(e: KeyboardEvent) => void | undefined>(undefined)
  const ctrlPressed = useRef<boolean>(false)

  const removeKanvasHotkeys = useCallback(() => {
    if (listenerRef.current) window.removeEventListener('keydown', listenerRef.current);
    if (shiftListenerRef.current) window.removeEventListener('keydown', shiftListenerRef.current);
    if (ctrlListenerRef.current) window.removeEventListener('keydown', ctrlListenerRef.current);

  }, []);
  const setupKanvasHotkeys = useCallback(() => {
    const handleKeydown = (e: KeyboardEvent) => {
      try {
        // Check if user is typing in an input field or textarea
        const target = e.target as HTMLElement;
        if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
          return;
        }

        // Example bindings — you can customize these
        if(isHotKeysDisabled) {
          removeKanvasHotkeys();
          return;
        }

        // Check if e.key exists and is a string before calling toLowerCase
        if (!e.key || typeof e.key !== 'string') {
          console.warn('Invalid keyboard event key:', e.key);
          return;
        }

        switch (e.key.toLowerCase()) {
        case 'v': // mouse move tool
          setSelectedTool({ type: 'mouse', option: 'move' });
          break;
        case 'h': // hand tool
          setSelectedTool({ type: 'mouse', option: 'hand' });
          break;
        case 'k': // scale tool
          setSelectedTool({ type: 'mouse', option: 'scale' });
          break;
        case 'l': // rectangle shape
          setSelectedTool({ type: 'inclined', option: shiftPressed.current ? 'arrow' : 'line' });
          break;
        case 'r': // ellipse shape
          setSelectedTool({ type: 'shapes', option: 'rectangle' });
          break;
        case 't': // text tool
          setSelectedTool({ type: 'text' });
          break;
        case 'o': // line
          setSelectedTool({ type: 'shapes', option: 'ellipse' });
          break;
        case 'a': // arrow
          setSelectedTool({ type: 'inclined', option: 'arrow' });
          break;
        case 'p': // pen
          setSelectedTool({ type: 'pen', option: shiftPressed.current ? 'pencil':'pen' });
          break;
        case 's': // pen
          if(shiftPressed.current) setSelectedTool({ type: 'frame', option: 'frame'})
          break;
        case 'f': // pen
          setSelectedTool({ type: 'frame', option: 'frame' });
          break;
        default:
          break;
      }
      } catch (error: any) {
        console.error('Error in keyboard event handler:', error);
        showToast.error('An error occurred with keyboard shortcuts. Please refresh the page if issues persist.');
      }
    };

    // Store references for cleanup
    listenerRef.current = handleKeydown;
    
    window.addEventListener('keydown', handleKeydown);
    
    //shift handle with error handling
    const handleShiftKeydown = (e: KeyboardEvent) => {
      try {
        if(e.key === "Shift") shiftPressed.current = true;
      } catch (error: any) {
        console.error('Error in shift keydown handler:', error);
      }
    };
    
    const handleShiftKeyup = (e: KeyboardEvent) => {
      try {
        if(e.key === "Shift") shiftPressed.current = false;
      } catch (error: any) {
        console.error('Error in shift keyup handler:', error);
      }
    };
    
    shiftListenerRef.current = handleShiftKeydown;
    window.addEventListener('keydown', handleShiftKeydown);
    window.addEventListener('keyup', handleShiftKeyup);

    //ctrl handle with error handling
    const handleCtrlKeydown = (e: KeyboardEvent) => {
      try {
        if(e.key === "Control") ctrlPressed.current = true;
      } catch (error: any) {
        console.error('Error in ctrl keydown handler:', error);
      }
    };
    
    const handleCtrlKeyup = (e: KeyboardEvent) => {
      try {
        if(e.key === "Control") ctrlPressed.current = false;
      } catch (error: any) {
        console.error('Error in ctrl keyup handler:', error);
      }
    };
    
    ctrlListenerRef.current = handleCtrlKeydown;
    window.addEventListener('keydown', handleCtrlKeydown);
    window.addEventListener('keyup', handleCtrlKeyup);


  }, [setSelectedTool, isHotKeysDisabled, removeKanvasHotkeys]);



  return {
    setupKanvasHotkeys,
    removeKanvasHotkeys,
    setSelectedTool,
  };
};
