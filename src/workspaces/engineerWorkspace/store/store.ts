import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface WorkspaceFile {
  id: string;
  name: string;
  content?: string;
  type: 'file' | 'folder';
  children?: WorkspaceFile[];
}

export interface WorkspaceTab {
  id: string;
  name: string;
  file: WorkspaceFile;
}

interface WorkspaceState {
  isOpen: boolean;
  openWorkspace: () => void;
  closeWorkspace: () => void;
  explorer: WorkspaceFile[];
  tabs: WorkspaceTab[];
  currentTab: WorkspaceTab | null;
  currentFile: WorkspaceFile | null;
  setCurrentTab: (tab: WorkspaceTab | null) => void;
  setCurrentFile: (file: WorkspaceFile | null) => void;
  addTab: (tab: WorkspaceTab) => void;
  closeTab: (tab: WorkspaceTab) => void;
  addFile: (file: WorkspaceFile, parentId?: string) => void;
  addFolder: (folder: WorkspaceFile, parentId?: string) => void;
  updateFile: (fileId: string, updates: Partial<WorkspaceFile>) => void;
  deleteFile: (fileId: string) => void;
  isFullScreen: boolean;
  setFullScreen: (isFullScreen: boolean) => void;
  fullScreenStyles: string;
  notFullScreenStyles: string;
}

const MOCK_EXPLORER: WorkspaceFile[] = [
  {
    id: '1',
    name: 'IRIS-BE',
    type: 'folder',
    children: [
      {
        id: '2',
        name: 'src',
        type: 'folder',
        children: [
          {
            id: '7',
            name: 'src.jade',
            type: 'file',
            content: "const srcJade = 'test'",
          },
        ],
      },
      {
        id: '3',
        name: 'routes',
        type: 'folder',
        children: [
          {
            id: '8',
            name: 'routes.ts',
            type: 'file',
            content: "const routes = 'test'",
          },
        ],
      },
      {
        id: '4',
        name: 'index.jade',
        type: 'file',
        content: "const indexJade = 'test'",
      },
    ],
  },
  {
    id: '5',
    name: 'utils',
    type: 'folder',
    children: [
      {
        id: '6',
        name: 'index.ts',
        type: 'file',
        content: "const indexTS = 'test'",
      },
    ],
  },
];

export const useWorkspaceStore = create<WorkspaceState>()(
  persist(
    (set, get) => ({
      isOpen: false,
      openWorkspace: () => set({ isOpen: true }),
      closeWorkspace: () => set({ isOpen: false }),
      explorer: MOCK_EXPLORER,
      tabs: [],
      currentTab: null,
      currentFile: null,
      setCurrentTab: (tab) => set({ currentTab: tab }),
      setCurrentFile: (file) => set({ currentFile: file }),
      addTab: (tab) =>
        set((state) => {
          const isAlreadyExist = state.tabs.some(
            (stateTab) => stateTab.id === tab.id
          );
          if (isAlreadyExist) return { tabs: [...state.tabs] };

          return { tabs: [...state.tabs, tab] };
        }),
      closeTab: (tab) =>
        set((state) => {
          const filteredTabList = state.tabs.filter(
            (stateTab) => stateTab.id !== tab.id
          );

          return { tabs: filteredTabList };
        }),
      addFile: (file, parentId) =>
        set((state) => {
          if (!parentId) {
            return { explorer: [...state.explorer, file] };
          }
          
          const addFileToParent = (files: WorkspaceFile[]): WorkspaceFile[] => {
            return files.map(f => {
              if (f.id === parentId && f.type === 'folder') {
                return {
                  ...f,
                  children: [...(f.children || []), file]
                };
              }
              if (f.children) {
                return {
                  ...f,
                  children: addFileToParent(f.children)
                };
              }
              return f;
            });
          };
          
          return { explorer: addFileToParent(state.explorer) };
        }),
      addFolder: (folder, parentId) =>
        set((state) => {
          if (!parentId) {
            return { explorer: [...state.explorer, folder] };
          }
          
          const addFolderToParent = (files: WorkspaceFile[]): WorkspaceFile[] => {
            return files.map(f => {
              if (f.id === parentId && f.type === 'folder') {
                return {
                  ...f,
                  children: [...(f.children || []), folder]
                };
              }
              if (f.children) {
                return {
                  ...f,
                  children: addFolderToParent(f.children)
                };
              }
              return f;
            });
          };
          
          return { explorer: addFolderToParent(state.explorer) };
        }),
      updateFile: (fileId, updates) =>
        set((state) => {
          const updateFileInTree = (files: WorkspaceFile[]): WorkspaceFile[] => {
            return files.map(f => {
              if (f.id === fileId) {
                return { ...f, ...updates };
              }
              if (f.children) {
                return {
                  ...f,
                  children: updateFileInTree(f.children)
                };
              }
              return f;
            });
          };
          
          return { explorer: updateFileInTree(state.explorer) };
        }),
      deleteFile: (fileId) =>
        set((state) => {
          const deleteFileFromTree = (files: WorkspaceFile[]): WorkspaceFile[] => {
            return files.filter(f => {
              if (f.id === fileId) {
                return false;
              }
              if (f.children) {
                f.children = deleteFileFromTree(f.children);
              }
              return true;
            });
          };
          
          return { explorer: deleteFileFromTree(state.explorer) };
        }),
      isFullScreen: false,
      setFullScreen: (isFullScreen) => set({ isFullScreen }),
      fullScreenStyles: 'rounded-none shadow-none',
      notFullScreenStyles: 'rounded-2xl shadow-2xl',
    }),
    {
      name: 'workspace-storage', 
      partialize: (state) => ({ 
        explorer: state.explorer,
        tabs: state.tabs,
        currentTab: state.currentTab,
        currentFile: state.currentFile
      }),
    }
  )
);
