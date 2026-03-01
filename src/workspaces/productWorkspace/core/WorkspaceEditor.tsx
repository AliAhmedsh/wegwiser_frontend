import isHotkey from 'is-hotkey';
import React, {
  KeyboardEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  createEditor,
  Descendant,
  Editor,
  Node,
  Path,
  Range,
  Element as SlateElement,
  Text,
  Transforms
} from 'slate';
import { withHistory } from 'slate-history';
import {
  Editable,
  ReactEditor,
  RenderElementProps,
  RenderLeafProps,
  Slate,
  withReact,
} from 'slate-react';
import {
  CustomElement,
  CustomElementFormat,
  CustomTextKey,
} from '../types/custom-types';

import { withLinks } from '../plugins/withLinks';

import Element from './Element';
import Leaf from './Leaf';

import CopyIcon from '../../../assets/icons/CopyIcon.svg';
import SelectionOverlay from '../components/SelectionOverlay';
import LinkMiniForm from '../forms/LinkMiniForm';
import HorizontalContextMenu from '../sections/horizontal-context-menu/HorizontalContextMenu';
import MenuWS from '../sections/menu/MenuWS';
import TextSelectionMenu from '../../../components/TextSelectionMenu';

import copy from 'copy-to-clipboard';

import { useProductStore } from '@/entities/product/store';
import { useProductWorkspaceStore } from '@/store/productWorkspaceStore';
import { useAutoSave } from '../hooks/useAutoSave';
import { useSwotAutoSave } from '../hooks/useSwotAutoSave';
import useSelectedText from '../hooks/useSelectedText';
import useSelectedUrl from '../hooks/useSelectedUrl';
import Utility, { HOTKEYS } from '../lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

import { initialValue } from '../api/api';

const WorkspaceEditor = () => {
  const {
    isProcessing,
    setIsProcessing,
    isLinkFormOpen,
    setIsLinkFormOpen,
    currentDocument,
    documentContent,
    updateDocumentContent
  } = useProductWorkspaceStore();
  const { chosenProduct } = useProductStore();

  const editorWrapperRef = useRef<HTMLDivElement>(null);
  const [value, setValue] = useState<Descendant[]>(initialValue);
  const [editorKey, setEditorKey] = useState(0);
  const [isEditorReady, setIsEditorReady] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const saveStatusTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const previousDocumentIdRef = useRef<number | null>(null);

  // Validate and normalize content before setting it
  const validateAndNormalizeContent = useCallback((content: any): Descendant[] => {
    if (!Array.isArray(content) || content.length === 0) {
      return initialValue;
    }

    // Ensure each element has the required structure
    const normalizedContent = content.map((node: any) => {
      if (!node || typeof node !== 'object') {
        return { type: 'paragraph', children: [{ text: '' }] };
      }

      // Ensure element has type and children
      if (SlateElement.isElement(node)) {
        return {
          ...node,
          type: node.type || 'paragraph',
          children: Array.isArray(node.children) ? node.children : [{ text: '' }]
        };
      }

      // Ensure text nodes have text property
      if (Text.isText(node)) {
        return {
          ...node,
          text: typeof node.text === 'string' ? node.text : ''
        };
      }

      return node;
    });

    return normalizedContent;
  }, []);

  // Sync editor value only when the selected document changes (switch file or initial load).
  // Do NOT depend on documentContent: when user types, handleEditorChange updates the store,
  // and re-running this effect would overwrite value and reset cursor to start.
  useEffect(() => {
    // If no document is selected, don't initialize the editor
    if (!currentDocument) {
      setIsEditorReady(true);
      previousDocumentIdRef.current = null;
      return;
    }

    // Check if document changed - if so, temporarily disable editor
    const documentChanged = previousDocumentIdRef.current !== null && 
                           previousDocumentIdRef.current !== currentDocument.id;
    
    if (documentChanged) {
      // Completely unmount the editor when switching files
      setIsEditorReady(false);
      
      // Use a longer delay to ensure complete DOM cleanup
      setTimeout(() => {
        // Update the previous document ID
        previousDocumentIdRef.current = currentDocument.id;

        let newContent: Descendant[] = initialValue;

        if (documentContent && documentContent.length > 0) {
          newContent = validateAndNormalizeContent(documentContent);
        } else if (currentDocument?.content) {
          try {
            const parsedContent = JSON.parse(currentDocument.content);
            newContent = validateAndNormalizeContent(parsedContent);
          } catch (error) {
            console.warn('Failed to parse document content:', error);
            newContent = initialValue;
          }
        }

        setValue(newContent);
        setEditorKey(prev => prev + 1);
        
        // Add another small delay before re-enabling to ensure clean mount
        setTimeout(() => {
          setIsEditorReady(true);
        }, 50);
      }, 100);
    } else {
      // Initial load or same document
      previousDocumentIdRef.current = currentDocument.id;

      let newContent: Descendant[] = initialValue;

      if (documentContent && documentContent.length > 0) {
        newContent = validateAndNormalizeContent(documentContent);
      } else if (currentDocument?.content) {
        try {
          const parsedContent = JSON.parse(currentDocument.content);
          newContent = validateAndNormalizeContent(parsedContent);
        } catch (error) {
          console.warn('Failed to parse document content:', error);
          newContent = initialValue;
        }
      }

      setValue(newContent);
      setEditorKey(prev => prev + 1);
      setIsEditorReady(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- documentContent intentionally omitted: syncing on doc change only to avoid cursor jump on type
  }, [currentDocument?.id, validateAndNormalizeContent]);

  // Use appropriate auto-save hook based on document type
  const isSwotFile = currentDocument?.type === 'swot';
  
  // Only use workspace auto-save for non-SWOT files
  const { saveNow: saveNowWorkspace, hasUnsavedChanges: hasUnsavedChangesWorkspace } = useAutoSave({
    productId: chosenProduct?.id || 0,
    documentId: !isSwotFile ? (currentDocument?.id || 0) : 0, // Only pass ID for workspace documents
    content: value,
    title: currentDocument?.title || 'Document',
    delay: 500,
    onSaveStart: () => {
      if (!isSwotFile) setSaveStatus('saving');
    },
    onSaveSuccess: (response) => {
      if (!isSwotFile) {
        setSaveStatus('saved');
        if (saveStatusTimeoutRef.current) {
          clearTimeout(saveStatusTimeoutRef.current);
        }
        saveStatusTimeoutRef.current = setTimeout(() => {
          setSaveStatus('idle');
        }, 2000);
      }
    },
    onSaveError: (error) => {
      if (!isSwotFile) setSaveStatus('idle');
    },
  });

  const { saveNow: saveNowSwot, hasUnsavedChanges: hasUnsavedChangesSwot } = useSwotAutoSave({
    fileId: isSwotFile ? (currentDocument?.id || null) : null,
    content: value,
    title: currentDocument?.title || 'SWOT Analysis',
    delay: 1500,
    onSaveStart: () => {
      if (isSwotFile) setSaveStatus('saving');
    },
    onSaveSuccess: (response) => {
      if (isSwotFile) {
        setSaveStatus('saved');
        if (saveStatusTimeoutRef.current) {
          clearTimeout(saveStatusTimeoutRef.current);
        }
        saveStatusTimeoutRef.current = setTimeout(() => {
          setSaveStatus('idle');
        }, 2000);
      }
    },
    onSaveError: (error) => {
      if (isSwotFile) setSaveStatus('idle');
    },
  });

  const saveNow = isSwotFile ? saveNowSwot : saveNowWorkspace;
  const hasUnsavedChanges = isSwotFile ? hasUnsavedChangesSwot : hasUnsavedChangesWorkspace;


  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (saveStatusTimeoutRef.current) {
        clearTimeout(saveStatusTimeoutRef.current);
      }
    };
  }, []);

  const renderElement = useCallback(
    (props: RenderElementProps) => <Element {...props} />,
    []
  );
  const renderLeaf = useCallback(
    (props: RenderLeafProps) => <Leaf {...props} />,
    []
  );

  // Custom normalization function to ensure valid editor state
  const withNormalization = (editor: Editor) => {
    const { normalizeNode } = editor;

    editor.normalizeNode = (entry) => {
      const [node, path] = entry;

      // Ensure all elements have a type
      if (SlateElement.isElement(node) && !node.type) {
        Transforms.setNodes(editor, { type: 'paragraph' }, { at: path });
        return;
      }

      // Ensure all text nodes have text property
      if (Text.isText(node) && typeof node.text !== 'string') {
        Transforms.setNodes(editor, { text: '' }, { at: path });
        return;
      }

      // Ensure empty editor has at least one paragraph
      if (Editor.isEditor(node) && node.children.length === 0) {
        Transforms.insertNodes(editor, {
          type: 'paragraph',
          children: [{ text: '' }],
        }, { at: [0] });
        return;
      }

      // Call the default normalization
      normalizeNode(entry);
    };

    return editor;
  };

  const editor = useMemo(
    () => withNormalization(withHistory(withReact(withLinks(createEditor())))),
    [editorKey] // Recreate editor when key changes
  );

  const [selectedText] = useSelectedText(editor);
  const [selectedUrl] = useSelectedUrl(editor);

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (isHotkey('mod+`', event)) {
      event.preventDefault();
      Utility.toggleBlock(editor, 'code-block');
      return;
    }

    for (const hotkey in HOTKEYS) {
      if (isHotkey(hotkey, event)) {
        event.preventDefault();
        const mark = HOTKEYS[hotkey];
        Utility.toggleMark(editor, mark);
      }
    }
  };

  const insertMiniPromptForm = () => {
    const { selection } = editor;

    const miniForm: CustomElement = {
      type: 'prompt-mini-form',
      formData: { prompt: '' },
      children: [{ text: '' }],
    };

    if (!selection) return;

    const selectionEndPoint = Range.isCollapsed(selection)
      ? selection.anchor
      : Editor.end(editor, selection);

    const blockAtEndPoint = Editor.above(editor, {
      at: selectionEndPoint,
      match: (n) =>
        !Editor.isEditor(n) &&
        SlateElement.isElement(n) &&
        Editor.isBlock(editor, n),
    });

    if (blockAtEndPoint) {
      const [, lastSelectedBlockPath] = blockAtEndPoint;
      const insertionPath = Path.next(lastSelectedBlockPath);

      Transforms.insertNodes(editor, miniForm, { at: insertionPath });
      return;
    }

    Transforms.insertNodes(editor, miniForm, { at: Editor.end(editor, []) });
    Transforms.insertNodes(editor, {
      type: 'paragraph',
      children: [{ text: '' }],
    });
    Transforms.select(editor, Editor.end(editor, []));
    ReactEditor.focus(editor);
  };

  const handleMenuBtnMouseDown = useCallback(
    (
      event: React.MouseEvent<HTMLSpanElement>,
      format: CustomTextKey | CustomElementFormat,
      type: 'mark' | 'block'
    ) => {
      event.preventDefault();

      if (type === 'mark') {
        Utility.toggleMark(editor, format as CustomTextKey);
        return;
      }

      Utility.toggleBlock(editor, format as CustomElementFormat);
    },
    [editor]
  );

  const menuItems = [
    {
      label: 'Analyze',
      onClick: () => {
        setIsProcessing(true);
        insertMiniPromptForm();
      },
    },
    {
      label: 'Expand',
      onClick: () => {
        setIsProcessing(true);
        insertMiniPromptForm();
      },
      disabled: isProcessing,
    },
    {
      label: 'Ask AI',
      onClick: () => {
        setIsProcessing(true);
        insertMiniPromptForm();
      },
    },
    {
      iconComponent: <CopyIcon className="w-4 h-4" />,
      onClick: () => {
        if (!editor.selection) return;

        const fragment = Editor.fragment(editor, editor.selection);
        const text = fragment.map((n) => Node.string(n)).join('\n');

        copy(text);
      },
    },
  ];

  // Handle editor changes with error handling
  const handleEditorChange = useCallback((newValue: Descendant[]) => {
    try {
      // Validate the new value before setting it
      const validatedValue = validateAndNormalizeContent(newValue);
      setValue(validatedValue);
      updateDocumentContent(validatedValue);
    } catch (error) {
      console.error('Error handling editor change:', error);
      // Fallback to previous value if there's an error
      setValue(value);
    }
  }, [validateAndNormalizeContent, updateDocumentContent, value]);

  // Don't render the editor until it's ready
  if (!isEditorReady) {
    return (
      <div className="flex items-center justify-center h-full min-h-[400px]">
        <div className="flex items-center gap-2 text-gray-500">
          <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span>Loading document...</span>
        </div>
      </div>
    );
  }

  // Show placeholder when no file is selected
  if (!currentDocument) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[400px] text-center px-4">
        <svg 
          className="w-16 h-16 text-gray-300 mb-4" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={1.5} 
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" 
          />
        </svg>
        <h3 className="text-lg font-semibold text-gray-700 mb-2">No File Selected</h3>
        <p className="text-sm text-gray-500 max-w-md">
          Please select a file from the left sidebar to start editing, or click "Add File" to create a new document.
        </p>
      </div>
    );
  }

  return (
    <>
      <HorizontalContextMenu menuItems={menuItems}>
        <div
          ref={editorWrapperRef}
          className="relative selection:bg-[#AB55DC17] overflow-visible"
        >
          <Slate
            key={`${currentDocument?.id || 'no-document'}-${editorKey}`}
            editor={editor}
            value={value}
            onChange={handleEditorChange}
          >
            {/* Save Status Tooltip - Inside Editor */}
            <AnimatePresence>
              {saveStatus !== 'idle' && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.2 }}
                  className="absolute z-50 flex items-center justify-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-medium shadow-lg"
                  style={{
                    top: saveStatus === 'saved' ? '-7px' : '-8px',
                    right: '-8px',
                    backgroundColor: saveStatus === 'saving' ? '#dbeafe' : '#dcfce7',
                    color: saveStatus === 'saving' ? '#2563eb' : '#16a34a'
                  }}
                >
                  {saveStatus === 'saving' ? (
                    <>
                      <svg className="animate-spin h-2.5 w-2.5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <motion.svg 
                        className="h-2.5 w-2.5" 
                        fill="none" 
                        viewBox="0 0 24 24" 
                        stroke="currentColor"
                        initial={{ scale: 0, pathLength: 0 }}
                        animate={{ scale: 1, pathLength: 1 }}
                        transition={{ duration: 0.3, ease: "easeOut" }}
                      >
                        <motion.path 
                          strokeLinecap="round" 
                          strokeLinejoin="round" 
                          strokeWidth={3} 
                          d="M5 13l4 4L19 7"
                          initial={{ pathLength: 0 }}
                          animate={{ pathLength: 1 }}
                          transition={{ duration: 0.4, ease: "easeOut" }}
                        />
                      </motion.svg>
                      <span>Saved</span>
                    </>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
            
            <MenuWS
              onMouseDown={handleMenuBtnMouseDown}
              className={`fixed left-1/2 translate-x-[-50%] bottom-12 px-4 py-2 bg-[#fff] rounded-md`}
            />
            <Editable
              renderElement={renderElement}
              renderLeaf={renderLeaf}
              placeholder="Enter some rich text…"
              spellCheck
              autoFocus
              onKeyDown={onKeyDown}
              onError={(error) => {
                console.error('Slate editor error:', error);
                // Reset editor state on error
                try {
                  setValue(initialValue);
                  setEditorKey(prev => prev + 1);
                } catch (e) {
                  console.error('Failed to reset editor:', e);
                }
              }}
              style={{
                minHeight: '200px',
                outline: 'none',
              }}
              data-slate-editor="true"
            />
            <SelectionOverlay
              ref={editorWrapperRef}
              processing={isProcessing}
            />
            {isLinkFormOpen && (
              <LinkMiniForm
                onClose={() => setIsLinkFormOpen(false)}
                initialText={selectedText}
                initialUrl={selectedUrl}
              />
            )}
          </Slate>
        </div>
      </HorizontalContextMenu>
      
      <TextSelectionMenu
        containerSelector="[data-slate-editor='true']"
        currentTab="swot"
        useContentContext
        productId={chosenProduct?.id}
      />
    </>
  );
};

export default WorkspaceEditor;
