import type {
  Tool,
  MouseTool,
  FrameTool,
  InclinedTool,
  TextTool,
  ShapeTool,
  ChainTool,
  CodeTool, ShapeToolPolygon,
} from '@/workspaces/designWorkspace/types';

export function isTool(obj: unknown): obj is Tool {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'type' in obj
  );
}
export function isMouseTool(tool: unknown): tool is MouseTool {
  return isTool(tool) && tool.type === 'mouse';
}

export function isFrameTool(tool: unknown): tool is FrameTool {
  return isTool(tool) && tool.type === 'frame';
}

export function isInclinedTool(tool: unknown): tool is InclinedTool {
  return isTool(tool) && tool.type === 'inclined';
}

export function isTextTool(tool: unknown): tool is TextTool {
  return isTool(tool) && tool.type === 'text';
}

export function isShapeTool(tool: unknown): tool is ShapeTool {
  return isTool(tool) && tool.type === 'shapes';
}
export function isShapePolygonTool(tool: unknown): tool is ShapeToolPolygon {
  return isTool(tool) && tool.type === 'shapes' && tool.option === 'polygon' && 'polygonSidesCount' in tool;
}

export function isChainTool(tool: unknown): tool is ChainTool {
  return isTool(tool) && tool.type === 'chain';
}

export function isCodeTool(tool: unknown): tool is CodeTool {
  return isTool(tool) && tool.type === 'code';
}

