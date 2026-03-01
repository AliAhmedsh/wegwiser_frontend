import {
  CanvasGroup,
  CanvasInstance
} from '../../types';

type ClientRect = {
  x: number;
  y: number;
  width: number;
  height: number;
};

function degToRad(deg: number) {
  return (deg * Math.PI) / 180;
}

function getCorner(x: number, y: number, width: number, height: number, rotation: number) {
  const cos = Math.cos(rotation);
  const sin = Math.sin(rotation);
  return {
    x: x + width * cos - height * sin,
    y: y + width * sin + height * cos,
  };
}

export function getClientRectFromInstance(
  instance: Exclude<CanvasInstance, CanvasGroup>
): ClientRect {
  switch (instance.type) {
    case 'text':
    case 'rectangle':
    case 'ellipse':
    case 'image': {
      const { x = 0, y = 0, width = 0, height = 0, rotation = 0 } = instance.object;
      const rad = degToRad(rotation);

      const p1 = getCorner(x, y, 0, 0, rad);
      const p2 = getCorner(x, y, width, 0, rad);
      const p3 = getCorner(x, y, width, height, rad);
      const p4 = getCorner(x, y, 0, height, rad);

      const minX = Math.min(p1.x, p2.x, p3.x, p4.x);
      const minY = Math.min(p1.y, p2.y, p3.y, p4.y);
      const maxX = Math.max(p1.x, p2.x, p3.x, p4.x);
      const maxY = Math.max(p1.y, p2.y, p3.y, p4.y);

      return {
        x: minX,
        y: minY,
        width: maxX - minX,
        height: maxY - minY,
      };
    }

    case 'star':
    case 'polygon': {
      const { x = 0, y = 0, outerRadius = 0, radius = 0 } = instance.object;
      const r = outerRadius || radius;
      return {
        x: x - r,
        y: y - r,
        width: r * 2,
        height: r * 2,
      };
    }

    case 'line':
    case 'arrow':
    case 'pen': {
      const { points = [] } = instance.object;
      if (points.length < 2) {
        return { x: 0, y: 0, width: 0, height: 0 };
      }

      const xs = points.filter((_, i) => i % 2 === 0);
      const ys = points.filter((_, i) => i % 2 === 1);

      const minX = Math.min(...xs);
      const maxX = Math.max(...xs);
      const minY = Math.min(...ys);
      const maxY = Math.max(...ys);

      return {
        x: minX,
        y: minY,
        width: maxX - minX,
        height: maxY - minY,
      };
    }

    default: {
      const { x = 0, y = 0, width = 0, height = 0 } = (instance as CanvasInstance).object ?? {};
      return { x, y, width, height };
    }
  }
}
