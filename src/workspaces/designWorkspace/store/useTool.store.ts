// store/useToolStore.ts
import { create } from 'zustand';

import { Tool } from '@/workspaces/designWorkspace/types/toolbar/toolType';

interface ToolStore {
  selectedTool: Tool;
  setSelectedTool: (tool: Tool) => void;
  setHotKeyDisabled: (isDisabled: boolean) => void;
  isHotKeysDisabled: boolean;
}

export const useToolStore = create<ToolStore>((set) => ({
  isHotKeysDisabled: false,
  selectedTool: {type: "mouse", option: "move"},
  setHotKeyDisabled: (isDisabled: boolean) => set({isHotKeysDisabled:isDisabled}),
  setSelectedTool: (tool) => set({ selectedTool: tool }),
}));
