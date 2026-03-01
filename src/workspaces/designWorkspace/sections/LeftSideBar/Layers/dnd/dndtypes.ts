import { CanvasInstance } from '@/workspaces/designWorkspace/types';

export function isSourceCanvasInstance(target: unknown): target is CanvasInstance {
  return (
    typeof target === "object" &&
    target !== null &&
    "type" in target
  );
}
