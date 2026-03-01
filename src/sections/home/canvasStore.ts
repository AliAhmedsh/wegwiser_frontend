import { create } from 'zustand';

interface offset {
  x: number;
  y: number;
}

interface CanvasStore {
  scale: number;
  offset: offset;
  setOffset: (offset: offset) => void;
  setScale: (newScale: number) => void;
}

export const useCanvasStore = create<CanvasStore>((set) => ({
  scale: 1,
  offset: { x: 0, y: 0 },
  setOffset: (offset) => set({ offset: { ...offset } }),
  setScale: (newScale) => set({ scale: newScale }),
}));
