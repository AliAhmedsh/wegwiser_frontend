import { WorkspaceDocument } from '@/workspaces/productWorkspace/api/workspaceDocumentService';
import { Descendant } from 'slate';
import { create } from 'zustand';

type ProductWorkspaceStore = {
  // Existing state
  isProcessing: boolean;
  setIsProcessing: (isProcessing: boolean) => void;

  isLinkFormOpen: boolean;
  setIsLinkFormOpen: (isOpen: boolean) => void;

  // Document state
  currentDocument: WorkspaceDocument | null;
  setCurrentDocument: (document: WorkspaceDocument | null) => void;

  documentContent: Descendant[];
  setDocumentContent: (content: Descendant[]) => void;

  documentTitle: string;
  setDocumentTitle: (title: string) => void;

  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;

  lastSavedAt: string | null;
  setLastSavedAt: (timestamp: string | null) => void;

  hasUnsavedChanges: boolean;
  setHasUnsavedChanges: (hasChanges: boolean) => void;

  // Actions
  loadDocument: (documentId: number) => Promise<void>;
  createNewDocument: (productId: number, title: string, content?: Descendant[]) => Promise<WorkspaceDocument | null>;
  updateDocumentTitle: (title: string) => void;
  updateDocumentContent: (content: Descendant[]) => void;
  resetDocumentState: () => void;
};

export const useProductWorkspaceStore = create<ProductWorkspaceStore>(
  (set, get) => ({
    // Existing state
    isProcessing: false,
    setIsProcessing: (isProcessing) => set({ isProcessing }),

    isLinkFormOpen: false,
    setIsLinkFormOpen: (isLinkFormOpen) => set({ isLinkFormOpen }),

    // Document state
    currentDocument: null,
    setCurrentDocument: (document) => set({ currentDocument: document }),

    documentContent: [],
    setDocumentContent: (content) => set({ documentContent: content }),

    documentTitle: '',
    setDocumentTitle: (title) => set({ documentTitle: title }),

    isLoading: false,
    setIsLoading: (loading) => set({ isLoading: loading }),

    lastSavedAt: null,
    setLastSavedAt: (timestamp) => set({ lastSavedAt: timestamp }),

    hasUnsavedChanges: false,
    setHasUnsavedChanges: (hasChanges) => set({ hasUnsavedChanges: hasChanges }),

    // Actions
    loadDocument: async (documentId: number) => {
      set({ isLoading: true });
      try {
        const { workspaceDocumentService } = await import('@/workspaces/productWorkspace/api/workspaceDocumentService');
        const response = await workspaceDocumentService.getDocument(documentId);

        if (response.success) {
          const document = response.document;

          // Parse content if it's a string, otherwise use as is
          let content: Descendant[];
          try {
            content = typeof document.content === 'string'
              ? JSON.parse(document.content)
              : document.content;
          } catch {
            // Fallback to empty content if parsing fails
            content = [{ type: 'paragraph', children: [{ text: '' }] }];
          }

          set({
            currentDocument: document,
            documentContent: content,
            documentTitle: document.title,
            lastSavedAt: document.updatedAt,
            hasUnsavedChanges: false,
            isLoading: false,
          });
        } else {
          throw new Error('Failed to load document');
        }
      } catch (error) {
        console.error('Error loading document:', error);
        set({ isLoading: false });
        throw error;
      }
    },

    createNewDocument: async (productId: number, title: string, content?: Descendant[]) => {
      set({ isLoading: true });
      try {
        const { workspaceDocumentService } = await import('@/workspaces/productWorkspace/api/workspaceDocumentService');
        const defaultContent = content || [{ type: 'paragraph', children: [{ text: '' }] }];

        const response = await workspaceDocumentService.createDocument(productId, {
          title,
          content: JSON.stringify(defaultContent),
          type: 'document',
        });

        if (response.success) {
          const document = response.document;
          set({
            currentDocument: document,
            documentContent: defaultContent,
            documentTitle: document.title,
            lastSavedAt: document.updatedAt,
            hasUnsavedChanges: false,
            isLoading: false,
          });
          return document;
        } else {
          throw new Error('Failed to create document');
        }
      } catch (error) {
        console.error('Error creating document:', error);
        set({ isLoading: false });
        throw error;
      }
    },

    updateDocumentTitle: (title: string) => {
      set({ documentTitle: title, hasUnsavedChanges: true });
    },

    updateDocumentContent: (content: Descendant[]) => {
      set({ documentContent: content, hasUnsavedChanges: true });
    },

    resetDocumentState: () => {
      set({
        currentDocument: null,
        documentContent: [],
        documentTitle: '',
        lastSavedAt: null,
        hasUnsavedChanges: false,
        isLoading: false,
      });
    },
  })
);
