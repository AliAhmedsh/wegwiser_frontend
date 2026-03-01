import { CanvasInstance } from "../types";
import { create } from "zustand";
// import { mockCanvasInstances } from "@/workspaces/designWorkspace/sections/LeftSideBar/Layers/dnd/mockLayers";

interface CanvasState {
  layers: CanvasInstance[];
  isAIGenerated: boolean; // Flag to prevent auto-save from clearing AI-generated designs
  setAIGenerated: (value: boolean) => void;
  insertBefore: (movingId: string, targetId: string) => void;
  insertAfter: (movingId: string, targetId: string) => void;
  insertInto: (movingId: string, targetId: string) => void;
  addInstance: (newInstance: CanvasInstance, parentId?: string | null) => void;
  toggleGroupIsOpen: (groupId: string) => void;
  updateInstance: (id: string, updater: (instance: CanvasInstance) => CanvasInstance) => void;
  getInstanceById: (id: string) => CanvasInstance | null;
  deleteInstance: (id: string) => void;
}

export const useCanvasLayersStore = create<CanvasState>((set,get) => {
  const toggleGroupById = (items: CanvasInstance[], groupId: string): CanvasInstance[] => {
    return items.map((item) => {
      if (item.type === "group") {
        if (item.id === groupId) {
          return { ...item, isOpen: !item.isOpen };
        }
        return { ...item, children: toggleGroupById(item.children, groupId) };
      }
      return item;
    });
  };
  const findInstanceById = (
    items: CanvasInstance[],
    id: string
  ): CanvasInstance | null => {
    for (const item of items) {
      if (item.id === id) {
        return item;
      }
      if (item.type === "group") {
        const found = findInstanceById(item.children, id);
        if (found) return found;
      }
    }
    return null;
  };
  const updateInstanceById = (
    items: CanvasInstance[],
    id: string,
    updater: (instance: CanvasInstance) => CanvasInstance
  ): CanvasInstance[] => {
    return items.map((item) => {
      if (item.id === id) {
        return updater(item);
      }

      if (item.type === "group") {
        return {
          ...item,
          children: updateInstanceById(item.children, id, updater),
        };
      }

      return item;
    });
  };

  const findAndRemove = (
    items: CanvasInstance[],
    id: string
  ): [CanvasInstance | null, CanvasInstance[]] => {
    let removed: CanvasInstance | null = null;

    const newItems = items.reduce<CanvasInstance[]>((acc, item) => {
      if (item.id === id) {
        removed = item;
        return acc;
      }

      if (item.type === "group") {
        const [childRemoved, newChildren] = findAndRemove(item.children, id);
        if (childRemoved) {
          removed = childRemoved;
          acc.push({ ...item, children: newChildren });
          return acc;
        }
      }

      acc.push(item);
      return acc;
    }, []);

    return [removed, newItems];
  };

  const insertRelative = (
    items: CanvasInstance[],
    targetId: string,
    itemToInsert: CanvasInstance,
    position: "before" | "after"
  ): CanvasInstance[] => {
    const idx = items.findIndex((item) => item.id === targetId);

    if (idx !== -1) {
      const newItems = [...items];
      const insertIdx = position === "before" ? idx : idx + 1;
      newItems.splice(insertIdx, 0, itemToInsert);
      return newItems;
    }

    return items.map((item) => {
      if (item.type === "group") {
        return { ...item, children: insertRelative(item.children, targetId, itemToInsert, position) };
      }
      return item;
    });
  };

  const insertIntoGroup = (
    items: CanvasInstance[],
    targetId: string,
    itemToInsert: CanvasInstance
  ): CanvasInstance[] => {
    return items.map((item) => {
      if (item.id === targetId && item.type === "group") {
        console.log({ ...item, children: [itemToInsert, ...item.children] });
        return { ...item, children: [itemToInsert, ...item.children] };
      }
      if (item.type === "group") {
        return { ...item, children: insertIntoGroup(item.children, targetId, itemToInsert) };
      }
      return item;
    });
  };

  return {
    // layers: mockCanvasInstances,
    layers: [],
    isAIGenerated: false,
    setAIGenerated: (value: boolean) => set({ isAIGenerated: value }),
    insertBefore: (movingId, targetId) => {
      set((state) => {
        const [removed, withoutRemoved] = findAndRemove(state.layers, movingId);
        if (!removed) return state;

        const updated = insertRelative(withoutRemoved, targetId, removed, "before");
        return { layers: updated };
      });
    },

    insertAfter: (movingId, targetId) => {
      set((state) => {
        const [removed, withoutRemoved] = findAndRemove(state.layers, movingId);
        if (!removed) return state;

        const updated = insertRelative(withoutRemoved, targetId, removed, "after");
        return { layers: updated };
      });
    },

    insertInto: (movingId, targetId) => {
      console.log('insertInto');
      set((state) => {
        const [removed, withoutRemoved] = findAndRemove(state.layers, movingId);
        if (!removed) return state;

        const updated = insertIntoGroup(withoutRemoved, targetId, removed);
        return { layers: updated };
      });
    },

    addInstance: (newInstance, parentId = null) => {
      const insertInto = (items: CanvasInstance[], parentId: string | null): CanvasInstance[] => {
        if (parentId === null) return [newInstance, ...items];

        return items.map((item) => {
          if (item.id === parentId && item.type === "group") {
            return { ...item, children: [...item.children, newInstance] };
          } else if (item.type === "group") {
            return { ...item, children: insertInto(item.children, parentId) };
          }
          return item;
        });
      };

      set((state) => ({
        layers: insertInto(state.layers, parentId),
      }));
    },
    toggleGroupIsOpen: (groupId: string) => {
      set((state) => {
          return {layers : toggleGroupById(state.layers, groupId)};
      })
    },
    updateInstance: (id, updater) => {
      set((state) => ({
        layers: updateInstanceById(state.layers, id, updater),
      }));
    },
    getInstanceById: (id) => {
      if (id === null) return null
      const layers = get().layers;
      return findInstanceById(layers, id);
    },
    deleteInstance: (id: string) => {
      set((state) => {
        const [, newLayers] = findAndRemove(state.layers, id);
        return { layers: newLayers };
      });
    }
  };
});
