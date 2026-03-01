import { useCallback, useEffect, useRef } from 'react';
import { Descendant, Element as SlateElement, Text } from 'slate';
import { workspaceDocumentService } from '../api/workspaceDocumentService';
import { fastApiService } from '@/lib/api/services/fastApiService';

interface AutoSaveOptions {
  productId: number;
  documentId: number;
  content: Descendant[];
  title?: string;
  delay?: number; // Default: 2000ms
  onSaveStart?: () => void;
  onSaveSuccess?: (response: any) => void;
  onSaveError?: (error: Error) => void;
}

export const useAutoSave = ({
  productId,
  documentId,
  content,
  title,
  delay = 2000,
  onSaveStart,
  onSaveSuccess,
  onSaveError,
}: AutoSaveOptions) => {
  const timeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const lastSavedContent = useRef<string>(JSON.stringify(content));
  const lastSavedTitle = useRef<string>(title || '');
  const isSavingRef = useRef<boolean>(false);
  const previousDocumentId = useRef<number | undefined>(undefined);
  const isInitialLoad = useRef<boolean>(true);

  // Sync content when document is loaded from backend (not when user edits)
  useEffect(() => {
    // If document ID changed, this means a new document was loaded
    // Sync the lastSavedContent with the loaded content to prevent unnecessary saves
    if (documentId && documentId !== previousDocumentId.current) {
      // Clear any pending save
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = undefined;
      }
      // Mark that we're in initial load phase
      isInitialLoad.current = true;
      previousDocumentId.current = documentId;
    } else if (!documentId) {
      // Reset when document ID is cleared
      previousDocumentId.current = undefined;
      isInitialLoad.current = true;
    }
    
    // If we're in initial load phase and content is not empty/initial, sync it
    // This handles the case where content loads after documentId is set
    if (isInitialLoad.current && documentId) {
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
  }, [documentId, content, title]);

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

  const saveDocument = useCallback(async () => {
    if (isSavingRef.current || !documentId || documentId === 0 || !productId || productId === 0) {
      return;
    }

    try {
      isSavingRef.current = true;
      onSaveStart?.();
      
      const contentString = JSON.stringify(content);
      const titleString = title || '';
      
      const isPrdFile = titleString === 'PRD';
      
      if (isPrdFile) {
        const prdId = localStorage.getItem('prd_id');
        const userId = localStorage.getItem('user_id');
        
        if (!prdId || !userId) {
          throw new Error('PRD ID or User ID not found');
        }
        
        const plainTextContent = slateToPlainText(content);
        const sessionId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        
        await fastApiService.workflowPrdUpdate({
          prd_id: prdId,
          change_reason: 'User edited PRD content',
          change_request: plainTextContent,
          changed_by: parseInt(userId, 10),
          session_id: sessionId,
        });
        
        lastSavedContent.current = contentString;
        lastSavedTitle.current = titleString;
        onSaveSuccess?.({ success: true });
      } else {
        const response = await workspaceDocumentService.autoSaveDocument(productId, documentId, {
          content: contentString,
          ...(titleString && { title: titleString }),
        });

        if (response.success) {
          lastSavedContent.current = contentString;
          lastSavedTitle.current = titleString;
          onSaveSuccess?.(response);
        } else {
          throw new Error('Auto-save failed');
        }
      }
    } catch (error) {
      onSaveError?.(error as Error);
    } finally {
      isSavingRef.current = false;
    }
  }, [productId, documentId, content, title, onSaveStart, onSaveSuccess, onSaveError]);

  useEffect(() => {
    // Don't save if:
    // 1. Document ID hasn't been set yet or is 0
    // 2. Document just changed (was loaded)
    // 3. We're still in initial load phase
    if (!documentId || documentId === 0 || documentId !== previousDocumentId.current || isInitialLoad.current) {
      return;
    }

    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Only save if content has actually changed (user edited, not loaded)
    const contentString = JSON.stringify(content);
    const titleString = title || '';
    
    if (
      contentString !== lastSavedContent.current ||
      titleString !== lastSavedTitle.current
    ) {
      timeoutRef.current = setTimeout(saveDocument, delay);
    }

    // Cleanup timeout on unmount
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [content, title, saveDocument, delay, documentId]);

  // Manual save function for immediate saves
  const saveNow = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    return saveDocument();
  }, [saveDocument]);

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
