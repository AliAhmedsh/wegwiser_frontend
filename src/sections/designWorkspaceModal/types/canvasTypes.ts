// export interface CanvasShape {
//   id: string;
//   type: 'square' | 'triangle' | 'circle' | 'diamond';
//   x: number;
//   y: number;
//   size: number;
//   color: string;
//   rotation?: number;
// }
//
// export interface CanvasLine {
//   id: string;
//   type: 'line';
//   points: [number, number, number, number];
//   color: string;
//   strokeWidth: number;
//   shapeType?: 'line' | 'rectangle' | 'ellipse' | 'polygon' | 'star' | 'arrow';
//   polygonSides?: number;
// }
//
// export interface CanvasText {
//   id: string;
//   type: 'text';
//   x: number;
//   y: number;
//   width: number;
//   height: number;
//   value: string;
//   fontSize: number;
//   color: string;
// }
//
// export interface Phone {
//   id: string;
//   x: number;
//   y: number;
//   width: number;
//   height: number;
//   rotation?: number;
// }
//
// export interface ActiveResize {
//   id: string;
//   type: 'shape' | 'phone';
//   corner: string;
//   startPointer: { x: number; y: number };
//   startSize: number;
// }
//
// export interface CanvasPen {
//   id: string;
//   type: 'pen';
//   points: number[]; // [x1, y1, x2, y2, ...]
//   color: string;
//   strokeWidth: number;
// }
//
// export type SelectionObject = {
//   type: 'line' | 'shape' | 'phone' | 'pen';
//   id: string;
// } | null;
