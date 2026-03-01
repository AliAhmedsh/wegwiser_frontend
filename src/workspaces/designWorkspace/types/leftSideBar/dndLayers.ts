import { CanvasInstance } from '@/workspaces/designWorkspace/types';

export type DndItemData = Pick<CanvasInstance, 'name'| 'id'| 'type'>

export const isDndItem = (item: unknown): item is DndItemData => {
  return typeof item === 'object' && item !== null && 'type' in item && 'id' in item && 'name' in item;
}
