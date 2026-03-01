import { Dispatch, SetStateAction } from 'react';
import { Object2D } from './types';
import { DraggableData } from 'react-draggable';

export function DynamicMovement(
  position: Object2D,
  scale: number,
  data: DraggableData,
  setFunction: Dispatch<SetStateAction<Object2D>>
) {
  const speedFactor = 1 / scale;

  setFunction((prev) => ({
    ...prev,
    x: position.x + data.deltaX * speedFactor,
    y: position.y + data.deltaY * speedFactor,
  }));
}

export function GetCenterCoordinate(offset: Object2D, scale: number) {
  const width = window.innerWidth;
  const height = window.innerHeight;

  const centerX = (width / 2 - offset.x) / scale;
  const centerY = (height / 2 - offset.y) / scale;

  return { centerX, centerY };
}
