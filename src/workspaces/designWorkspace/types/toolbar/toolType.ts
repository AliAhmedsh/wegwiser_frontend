export type ToolType = 'mouse' | 'frame' | 'inclined' | 'text' | 'shapes' | 'chain' | 'code' | 'pen';

export type MouseTypes = 'move' | 'hand' | 'scale';
export type FrameTypes = 'section' | 'frame' | 'slice';
export type InclinedTypes = 'line' | 'arrow' | 'rectangle' | 'ellipse' | 'star' | 'polygon' | 'image';
export type PenTypes = 'pen' | 'pencil';

export type ShapeTypes =
  | 'rectangle'
  | 'ellipse'
  | 'star'
  | 'polygon'
  | 'multimenu'

export interface BaseTool {
  type: ToolType;
}

export interface MouseTool extends BaseTool {
  type: 'mouse';
  option: MouseTypes;
}

export interface FrameTool extends BaseTool {
  type: 'frame';
  option: FrameTypes;
}

export interface InclinedTool extends BaseTool {
  type: 'inclined';
  option: InclinedTypes
}

export interface TextTool extends BaseTool {
  type: 'text';
}

export interface ShapeTool extends BaseTool {
  type: 'shapes';
  option: ShapeTypes;
}
export interface PenTool extends BaseTool {
  type: 'pen';
  option: PenTypes;
}
export interface ShapeToolPolygon extends ShapeTool {
  option: 'polygon';
  polygonSidesCount: number;
}

export interface ChainTool extends BaseTool {
  type: 'chain';
}

export interface CodeTool extends BaseTool {
  type: 'code';
}

// Finally, union type for all tools
export type Tool =
  | MouseTool
  | FrameTool
  | InclinedTool
  | TextTool
  | ShapeTool
  | ChainTool
  | ShapeToolPolygon
  | CodeTool
  | PenTool;


