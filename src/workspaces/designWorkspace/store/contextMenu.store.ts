import { create } from 'zustand';

type ContextMenuState = {
  showMenu: boolean;
  menuPosition: { x: number; y: number };
  selectedId: string | null;
  setMenuPosition: (pos: { x: number; y: number }) => void;
  setShowMenu: (show: boolean) => void;
  setSelectedId: (id: string | null) => void;
  reset: () => void;
};

export const useContextMenuStore = create<ContextMenuState>((set) => ({
  showMenu: false,
  menuPosition: { x: 0, y: 0 },
  selectedId: null,
  setMenuPosition: (pos) => set({ menuPosition: pos }),
  setShowMenu: (show) => set({ showMenu: show }),
  setSelectedId: (id) => set({ selectedId: id }),
  reset: () =>
    set({
      showMenu: false,
      menuPosition: { x: 0, y: 0 },
      selectedId: null
    }),
}));
