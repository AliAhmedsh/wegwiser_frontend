// store/shapeRefs.store.ts
import { create } from 'zustand';
import type Konva from 'konva';

type ShapeRefMap = Map<string, React.RefObject<Konva.Shape>>;

interface ShapeRefsStore {
  shapeRefs: ShapeRefMap;
  setShapeRef: (id: string, ref: React.RefObject<Konva.Shape>) => void;
  getRefById: (id: string) => React.RefObject<Konva.Shape> | undefined;
  clearShapeRefs: () => void;
}

export const useShapeRefsStore = create<ShapeRefsStore>((set, get) => ({
  shapeRefs: new Map(),

  setShapeRef: (id, ref) => {
    const updated = new Map(get().shapeRefs);
    updated.set(id, ref);
    set({ shapeRefs: updated });
  },

  getRefById: (id) => {
    return get().shapeRefs.get(id);
  },

  clearShapeRefs: () => {
    set({ shapeRefs: new Map() });
  },
}));
