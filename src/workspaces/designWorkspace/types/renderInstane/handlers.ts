import { KonvaEventObject, Node } from 'konva/lib/Node';

export interface HandlersObjects{
  onDragEnd: (e: KonvaEventObject<DragEvent, Node>) => void
  draggable: boolean
}