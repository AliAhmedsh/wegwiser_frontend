
import { RectConfig } from 'konva/lib/shapes/Rect';
import { LineConfig } from 'konva/lib/shapes/Line';
import { ArrowConfig } from 'konva/lib/shapes/Arrow';
import { StarConfig } from 'konva/lib/shapes/Star';
import { RegularPolygonConfig } from 'konva/lib/shapes/RegularPolygon';
import { ImageConfig } from 'konva/lib/shapes/Image';
import { TextConfig } from 'konva/lib/shapes/Text';
import Konva from 'konva';
import EllipseConfig = Konva.EllipseConfig;
import { ShapeTypes } from '@/workspaces/designWorkspace/types/toolbar';

export type CanvasInstancesTypes = "group" | "line" | "arrow" |  "image" | "text" | "pen" | & ShapeTypes;

export interface CanvasBase {
  id: string;
  name: string;
  type: CanvasInstancesTypes;
}

export interface CanvasGroup extends CanvasBase {
  type: 'group';
  children: CanvasInstance[];
  isOpen: boolean;
  object?: undefined;
}

export interface CanvasRectInstance extends CanvasBase {
  type: 'rectangle';
  object: RectConfig;
  children?: undefined;
}

export interface CanvasEllipseInstance extends CanvasBase {
  type: 'ellipse';
  object: EllipseConfig;
  children?: undefined;
}

export interface CanvasLineInstance extends CanvasBase {
  type: 'line';
  object: LineConfig;
  children?: undefined;
}

export interface CanvasArrowInstance extends CanvasBase {
  type: 'arrow';
  object: ArrowConfig;
  children?: undefined;
}

export interface CanvasStarInstance extends CanvasBase {
  type: 'star';
  object: StarConfig;
  children?: undefined;
}

export interface CanvasPolygonInstance extends CanvasBase {
  type: 'polygon';
  object: RegularPolygonConfig;
  children?: undefined;
}


export interface CanvasImageInstance extends CanvasBase {
  type: 'image';
  object: ImageConfig & { image: HTMLImageElement };
  children?: undefined;
}

export interface CanvasTextInstance extends CanvasBase {
  type: 'text';
  object: TextConfig;
  children?: undefined;
  editing?: boolean;
}

export interface CanvasPenInstance extends CanvasBase {
  type: 'pen';
  object: LineConfig;
  children?: undefined;
}

export type CanvasInstance =
  | CanvasGroup
  | CanvasRectInstance
  | CanvasEllipseInstance
  | CanvasLineInstance
  | CanvasArrowInstance
  | CanvasStarInstance
  | CanvasPolygonInstance
  | CanvasImageInstance
  | CanvasTextInstance
  | CanvasPenInstance;