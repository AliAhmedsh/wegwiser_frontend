import {
  CanvasArrowInstance,
  CanvasGroup,
  CanvasInstance,
  CanvasLineInstance,
  CanvasPenInstance,
  CanvasTextInstance,
} from './canvasTypes';

export function isCanvasGroup(instance: CanvasInstance): instance is CanvasGroup {
  return instance.type === "group";
}

export function isCanvasLineInstance(instance: CanvasInstance): instance is CanvasLineInstance {
  return instance.type === "line" && !!instance.object;
}

export function isCanvasArrowInstance(instance: CanvasInstance): instance is CanvasArrowInstance {
  return instance.type === "arrow" && !!instance.object;
}

export function isCanvasPenInstance(instance: CanvasInstance): instance is CanvasPenInstance {
  return instance.type === "pen" && !!instance.object;
}

export function isCanvasTextInstance(instance: CanvasInstance): instance is CanvasTextInstance {
  return instance.type === "text" && !!instance.object;
}
