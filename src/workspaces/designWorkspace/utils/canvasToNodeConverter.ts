import { CanvasInstance, CanvasGroup, CanvasRectInstance, CanvasTextInstance } from '@/workspaces/designWorkspace/types';
import { Node } from '@/lib/api/services/designAIService';

/**
 * Converts a hex color to token or hex format
 */
const getColorFromHex = (hex: string): { token?: string; hex?: string } => {
  if (!hex) return {};
  
  // Map common colors to tokens
  const hexToToken: Record<string, string> = {
    '#0A66C2': 'color.primary',
    '#E3F2FD': 'color.primary.light',
    '#084F95': 'color.primary.dark',
    '#FFFFFF': 'color.surface',
    '#000000': 'color.text',
    '#666666': 'color.text.secondary',
    '#F3F4F6': 'color.neutral',
    '#4CAF50': 'color.success',
    '#F44336': 'color.error',
    '#FF9800': 'color.warning',
  };
  
  const normalizedHex = hex.toUpperCase();
  if (hexToToken[normalizedHex]) {
    return { token: hexToToken[normalizedHex] };
  }
  
  return { hex: normalizedHex };
};

/**
 * Converts a CanvasInstance to a Node (for API requests)
 */
export const convertCanvasInstanceToNode = (instance: CanvasInstance, includeChildren = true): Node => {
  if (instance.type === 'group') {
    const group = instance as CanvasGroup;
    return {
      id: instance.id,
      name: instance.name,
      type: 'group',
      bounds: getBoundsFromGroup(group),
      fill: { token: 'color.surface' },
      children: includeChildren && group.children ? group.children.map(child => convertCanvasInstanceToNode(child, true)) : [],
    };
  }

  if (instance.type === 'rectangle') {
    const rect = instance as CanvasRectInstance;
    const obj = rect.object;
    return {
      id: instance.id,
      name: instance.name,
      type: 'rect',
      bounds: {
        x: obj.x || 0,
        y: obj.y || 0,
        w: obj.width || 100,
        h: obj.height || 100,
      },
      fill: typeof obj.fill === 'string' ? getColorFromHex(obj.fill) : undefined,
      stroke: obj.stroke && typeof obj.stroke === 'string' ? {
        width: obj.strokeWidth || 1,
        hex: obj.stroke,
      } : undefined,
      children: [],
    };
  }

  if (instance.type === 'text') {
    const text = instance as CanvasTextInstance;
    const obj = text.object;
    return {
      id: instance.id,
      name: instance.name,
      type: 'text',
      bounds: {
        x: obj.x || 0,
        y: obj.y || 0,
        w: obj.width || 200,
        h: obj.height || 20,
      },
      text: obj.text || instance.name,
      font_token: obj.fontSize ? `type_scale.${obj.fontSize}` : undefined,
      fill: typeof obj.fill === 'string' ? getColorFromHex(obj.fill) : undefined,
      children: [],
    };
  }

  // Default: convert to rect
  const obj = (instance as any).object || {};
  return {
    id: instance.id,
    name: instance.name,
    type: 'rect',
    bounds: {
      x: obj.x || 0,
      y: obj.y || 0,
      w: obj.width || 100,
      h: obj.height || 100,
    },
    fill: typeof obj.fill === 'string' ? getColorFromHex(obj.fill) : undefined,
    children: [],
  };
};

/**
 * Gets bounds from a group by calculating from children
 */
const getBoundsFromGroup = (group: CanvasGroup): { x: number; y: number; w: number; h: number } => {
  if (!group.children || group.children.length === 0) {
    return { x: 0, y: 0, w: 100, h: 100 };
  }

  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;

  const processInstance = (inst: CanvasInstance) => {
    if (inst.type === 'group') {
      (inst as CanvasGroup).children.forEach(processInstance);
    } else {
      const obj = (inst as any).object || {};
      const x = obj.x || 0;
      const y = obj.y || 0;
      const w = obj.width || 0;
      const h = obj.height || 0;

      minX = Math.min(minX, x);
      minY = Math.min(minY, y);
      maxX = Math.max(maxX, x + w);
      maxY = Math.max(maxY, y + h);
    }
  };

  group.children.forEach(processInstance);

  return {
    x: minX === Infinity ? 0 : minX,
    y: minY === Infinity ? 0 : minY,
    w: maxX === -Infinity ? 100 : maxX - minX,
    h: maxY === -Infinity ? 100 : maxY - minY,
  };
};

/**
 * Builds document structure from canvas layers
 */
export const buildDocumentFromLayers = (layers: CanvasInstance[]): { id: string; children: Node[] } => {
  return {
    id: 'root-frame',
    children: layers.map(layer => convertCanvasInstanceToNode(layer, true)),
  };
};

