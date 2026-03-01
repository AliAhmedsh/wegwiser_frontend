import Editor, { Monaco } from '@monaco-editor/react';
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useWorkspaceStore } from '../store/store';
import { useProductStore } from '@/entities/product/store';
import { useSelectedVehicleStore } from '@/entities/vehicle/selectedVehicleStore';
import { engineeringFilesService } from '@/entities/tickets/api/engineeringFilesService';
import { showToast } from '@/lib/utils/toast';

const CodeEditor: React.FC = () => {
  const currentFile = useWorkspaceStore((state) => state.currentFile);
  const updateFile = useWorkspaceStore((state) => state.updateFile);
  const setCurrentFile = useWorkspaceStore((state) => state.setCurrentFile);
  const { chosenProduct } = useProductStore();
  const { selectedVehicleId } = useSelectedVehicleStore();
  const [editorError, setEditorError] = useState(false);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastSavedContentRef = useRef<string>('');

  const handleEditorWillMount = (monaco: Monaco) => {
    try {
      if (typeof window !== 'undefined' && (window as any).require) {
        (window as any).require.config({
          paths: {
            vs: 'https://cdn.jsdelivr.net/npm/monaco-editor@0.52.2/min/vs'
          },
          'vs/css': {
            load: (name: string, req: any, onLoad: any) => {
              onLoad();
            }
          }
        });
      }

      monaco.languages.typescript.typescriptDefaults.setWorkerOptions({
        customWorkerPath: undefined,
      });

      monaco.languages.typescript.javascriptDefaults.setWorkerOptions({
        customWorkerPath: undefined,
      });

      (monaco as any).Environment = {
        ...(monaco as any).Environment,
        getWorker: () => {
          return {
            postMessage: () => {},
            terminate: () => {},
            onmessage: null,
            onerror: null
          } as any;
        }
      };

      monaco.editor.defineTheme('custom-light', {
        base: 'vs', 
        inherit: true,
        rules: [
        ],
        colors: {
          'editor.background': '#EAEDF2', 
        },
      });
    } catch (error) {
      console.warn('Monaco configuration failed:', error);
    }
  };

  const handleEditorDidMount = () => {
    console.log('Monaco Editor mounted successfully');
    setEditorError(false);
  };

  const handleEditorDidFailToMount = (error: Error) => {
    console.error('Monaco Editor failed to mount:', error);
    setEditorError(true);
  };

  // Auto-save code to backend with debouncing
  const saveCodeToBackend = useCallback(async (fileId: string, content: string) => {
    if (!chosenProduct?.id || !selectedVehicleId) {
      return;
    }

    // Check if file has backend ID (numeric ID means it's from backend)
    const fileIdNum = parseInt(fileId);
    if (isNaN(fileIdNum)) {
      // Local file, don't save to backend yet
      return;
    }

    // Skip if content hasn't changed
    if (content === lastSavedContentRef.current) {
      return;
    }

    try {
      const response = await engineeringFilesService.updateFile(fileIdNum, {
        content,
        vehicleId: selectedVehicleId
      });

      if (response.success) {
        lastSavedContentRef.current = content;
        console.log('Code saved to backend');
      } else {
        console.error('Failed to save code:', response.error);
      }
    } catch (error) {
      console.error('Error saving code to backend:', error);
    }
  }, [chosenProduct?.id, selectedVehicleId]);

  const handleEditorChange = (value: string | undefined) => {
    if (currentFile && value !== undefined) {
      const updatedFile = { ...currentFile, content: value };
      updateFile(currentFile.id, { content: value });
      setCurrentFile(updatedFile);

      // Debounce auto-save (save after 2 seconds of no changes)
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }

      saveTimeoutRef.current = setTimeout(() => {
        saveCodeToBackend(currentFile.id, value);
      }, 2000);
    }
  };

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  // Update last saved content when file changes
  useEffect(() => {
    if (currentFile?.content) {
      lastSavedContentRef.current = currentFile.content;
    }
  }, [currentFile?.id]);

  if (editorError) {
    return (
      <div className="h-full flex flex-col items-center justify-center bg-[#EAEDF2] p-8">
        <div className="text-center">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">
            Code Editor Unavailable
          </h3>
          <p className="text-gray-600 mb-6">
            The Monaco Editor failed to load due to resource loading issues.
          </p>
          <div className="bg-white p-4 rounded-lg border max-w-md">
            <textarea
              className="w-full h-64 p-3 border rounded resize-none font-mono text-sm"
              placeholder="// Fallback text editor - Please choose a file to work with"
              value={currentFile?.content || ''}
              onChange={(e) => {
                if (currentFile) {
                  const value = e.target.value;
                  const updatedFile = { ...currentFile, content: value };
                  updateFile(currentFile.id, { content: value });
                  setCurrentFile(updatedFile);

                  // Debounce auto-save (save after 2 seconds of no changes)
                  if (saveTimeoutRef.current) {
                    clearTimeout(saveTimeoutRef.current);
                  }

                  saveTimeoutRef.current = setTimeout(() => {
                    saveCodeToBackend(currentFile.id, value);
                  }, 2000);
                }
              }}
            />
          </div>
          <button
            onClick={() => {
              setEditorError(false);
              window.location.reload();
            }}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Retry Monaco Editor
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full">
      <Editor
        height="100%"
        defaultLanguage="javascript"
        value={currentFile?.content || ''}
        defaultValue="// Please choose the file to work with"
        beforeMount={handleEditorWillMount}
        onMount={handleEditorDidMount}
        onChange={handleEditorChange}
        theme="custom-light"
        loading={
          <div className="flex items-center justify-center h-full bg-[#EAEDF2]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
              <p className="text-gray-600">Loading Monaco Editor...</p>
            </div>
          </div>
        }
        options={{
          minimap: { enabled: false },
          overviewRulerLanes: 0,
          hideCursorInOverviewRuler: true,
          overviewRulerBorder: false,
          scrollbar: {
            vertical: 'hidden',
            horizontal: 'hidden',
          },
          automaticLayout: true,
        }}
      />
    </div>
  );
};

export default CodeEditor;
