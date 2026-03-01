import Konva from 'konva';

export const getTransformedPointer = (stage: Konva.Stage) => {
  const pointer = stage.getPointerPosition();
  const scale = stage.scale();
  const position = stage.position();

  if (!pointer) return null;
  return {
    x: (pointer.x - position.x) / scale.x,
    y: (pointer.y - position.y) / scale.y,
  };
};