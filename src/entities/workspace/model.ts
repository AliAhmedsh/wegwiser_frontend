import { create } from 'zustand';

export interface WorkspaceFile {
  id: string;
  name: string;
  type: 'file' | 'folder';
  children?: WorkspaceFile[];
}

export interface WorkspaceTab {
  id: string;
  name: string;
}

interface WorkspaceState {
  isOpen: boolean;
  openWorkspace: () => void;
  closeWorkspace: () => void;
  explorer: WorkspaceFile[];
  tabs: WorkspaceTab[];
  currentTabId: string | null;
  setCurrentTab: (id: string) => void;
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
        children: [{ id: '7', name: 'src.jade', type: 'file' }],
      },
      {
        id: '3',
        name: 'routes',
        type: 'folder',
        children: [{ id: '8', name: 'routes.ts', type: 'file' }],
      },
      { id: '4', name: 'index.jade', type: 'file' },
    ],
  },
  {
    id: '5',
    name: 'utils',
    type: 'folder',
    children: [{ id: '6', name: 'index.ts', type: 'file' }],
  },
];

const MOCK_TABS: WorkspaceTab[] = [
  { id: 'tab1', name: 'Code.py' },
  { id: 'tab2', name: 'Code.py' },
];

export const useWorkspaceStore = create<WorkspaceState>((set) => ({
  isOpen: false,
  openWorkspace: () => set({ isOpen: true }),
  closeWorkspace: () => set({ isOpen: false }),
  explorer: MOCK_EXPLORER,
  tabs: MOCK_TABS,
  currentTabId: 'tab1',
  setCurrentTab: (id) => set({ currentTabId: id }),
  isFullScreen: false,
  setFullScreen: (isFullScreen) => set({ isFullScreen }),
  fullScreenStyles: 'rounded-none shadow-none',
  notFullScreenStyles: 'rounded-2xl shadow-2xl',
}));
