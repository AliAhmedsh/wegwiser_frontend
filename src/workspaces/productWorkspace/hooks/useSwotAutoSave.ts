import { useCallback, useEffect, useRef } from 'react';
import { Descendant, Element as SlateElement, Text } from 'slate';
import { swotFileService } from '@/lib/api/services/swotFileService';
import { fastApiService } from '@/lib/api/services/fastApiService';

interface SwotAutoSaveOptions {
  fileId: number | null;
  content: Descendant[];
  title?: string;
  delay?: number; // Default: 2000ms
  onSaveStart?: () => void;
  onSaveSuccess?: (response: any) => void;
  onSaveError?: (error: Error) => void;
}

export const useSwotAutoSave = ({
  fileId,
  content,
  title,
  delay = 2000,
  onSaveStart,
  onSaveSuccess,
  onSaveError,
}: SwotAutoSaveOptions) => {
  const timeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const lastSavedContent = useRef<string>('');
  const lastSavedTitle = useRef<string>('');
  const isSavingRef = useRef<boolean>(false);
  const previousFileId = useRef<number | null | undefined>(undefined);
  const isInitialLoad = useRef<boolean>(true);
  const contentRef = useRef<Descendant[]>(content);
  const titleRef = useRef<string | undefined>(title);
  const saveQueuedRef = useRef<boolean>(false);
  const onSaveStartRef = useRef(onSaveStart);
  const onSaveSuccessRef = useRef(onSaveSuccess);
  const onSaveErrorRef = useRef(onSaveError);

  useEffect(() => {
    onSaveStartRef.current = onSaveStart;
    onSaveSuccessRef.current = onSaveSuccess;
    onSaveErrorRef.current = onSaveError;
  }, [onSaveStart, onSaveSuccess, onSaveError]);

  useEffect(() => {
    contentRef.current = content;
    titleRef.current = title;
  }, [content, title]);

  // Sync content when file is loaded from backend (not when user edits)
  useEffect(() => {
    // If file ID changed, this means a new file was loaded
    // Sync the lastSavedContent with the loaded content to prevent unnecessary saves
    if (fileId && fileId !== previousFileId.current) {
      // Clear any pending save
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = undefined;
      }
      // Mark that we're in initial load phase
      isInitialLoad.current = true;
      previousFileId.current = fileId;
    } else if (!fileId) {
      // Reset when file ID is cleared
      previousFileId.current = undefined;
      isInitialLoad.current = true;
    }
    
    // If we're in initial load phase and content is not empty/initial, sync it
    // This handles the case where content loads after fileId is set
    if (isInitialLoad.current && fileId) {
      const contentString = JSON.stringify(content);
      const titleString = title || '';
      
      // Check if content is not empty/initial (has actual content)
      const hasActualContent = contentString !== JSON.stringify([{ type: 'paragraph', children: [{ text: '' }] }]) &&
                               contentString !== '[]';
      
      if (hasActualContent) {
        // Sync the loaded content as baseline
        lastSavedContent.current = contentString;
        lastSavedTitle.current = titleString;
        // Mark initial load as complete
        isInitialLoad.current = false;
      }
    }
  }, [fileId, content, title]);

  const slateToPlainText = (nodes: Descendant[]): string => {
    return nodes.map((node: any) => {
      if (Text.isText(node)) {
        return node.text || '';
      }
      if (SlateElement.isElement(node) && node.children) {
        return node.children.map((child: any) => {
          if (Text.isText(child)) {
            return child.text || '';
          }
          if (SlateElement.isElement(child) && child.children) {
            return slateToPlainText(child.children);
          }
          return '';
        }).join('');
      }
      return '';
    }).filter(text => text.trim() !== '').join('\n\n');
  };

  const saveFile = useCallback(async () => {
    if (!fileId) {
      return;
    }

    if (isSavingRef.current) {
      saveQueuedRef.current = true;
      return;
    }

    const contentToSave = contentRef.current;
    const titleToSave = titleRef.current || '';
    const contentString = JSON.stringify(contentToSave);

    if (contentString === lastSavedContent.current && titleToSave === lastSavedTitle.current) {
      return;
    }

    try {
      isSavingRef.current = true;
      saveQueuedRef.current = false;
      onSaveStartRef.current?.();
      
      const isPrdFile = titleToSave === 'PRD';
      
      if (isPrdFile) {
        const prdId = localStorage.getItem('prd_id');
        const userId = localStorage.getItem('user_id');
        
        if (!prdId || !userId) {
          isSavingRef.current = false;
          return;
        }
        
        const plainTextContent = slateToPlainText(contentToSave);
        const sessionId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        
        await fastApiService.workflowPrdUpdate({
          prd_id: prdId,
          change_reason: 'User edited PRD content',
          change_request: plainTextContent,
          changed_by: parseInt(userId, 10),
          session_id: sessionId,
        });
        
        lastSavedContent.current = contentString;
        lastSavedTitle.current = titleToSave;
        onSaveSuccessRef.current?.({ success: true });
      } else {
        const response = await swotFileService.updateFile(fileId, {
          content: contentString,
          ...(titleToSave && { title: titleToSave }),
        });

        if (response.success) {
          lastSavedContent.current = contentString;
          lastSavedTitle.current = titleToSave;
          onSaveSuccessRef.current?.(response);
        } else {
          throw new Error('Auto-save failed');
        }
      }
    } catch (error) {
      onSaveErrorRef.current?.(error as Error);
    } finally {
      isSavingRef.current = false;
      
      if (saveQueuedRef.current) {
        saveQueuedRef.current = false;
        setTimeout(() => saveFile(), 100);
      }
    }
  }, [fileId]);

  useEffect(() => {
    if (!fileId || fileId !== previousFileId.current || isInitialLoad.current) {
      return;
    }

    const contentString = JSON.stringify(content);
    const titleString = title || '';
    
    if (
      contentString === lastSavedContent.current &&
      titleString === lastSavedTitle.current
    ) {
      return;
    }

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      saveFile();
    }, delay);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [content, title, fileId, delay, saveFile]);

  // Manual save function for immediate saves
  const saveNow = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    return saveFile();
  }, [saveFile]);

  // Check if there are unsaved changes
  const hasUnsavedChanges = useCallback(() => {
    const contentString = JSON.stringify(content);
    const titleString = title || '';
    
    return (
      contentString !== lastSavedContent.current ||
      titleString !== lastSavedTitle.current
    );
  }, [content, title]);

  // Get last save timestamp
  const getLastSaveTime = useCallback(() => {
    return lastSavedContent.current !== JSON.stringify(content) || 
           lastSavedTitle.current !== (title || '') 
      ? null 
      : new Date().toISOString();
  }, [content, title]);

  return { 
    saveNow, 
    hasUnsavedChanges,
    getLastSaveTime,
    isSaving: isSavingRef.current
  };
};
