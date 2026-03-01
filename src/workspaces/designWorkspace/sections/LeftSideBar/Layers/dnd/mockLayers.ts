import { CanvasInstance } from '@/workspaces/designWorkspace/types';

// const imageElement = new Image();
// imageElement.src = 'https://konvajs.org/assets/lion.png'; // or any placeholder

export const mockCanvasInstances: CanvasInstance[] = [
  {
    id: 'rect-1',
    name: 'Rectangle 1',
    type: 'rectangle',
    object: {
      x: 50,
      y: 50,
      width: 100,
      height: 80,
      fill: 'red',
      stroke: 'black',
      strokeWidth: 2,
    },
  },
  {
    id: 'group-1',
    name: 'Group 1',
    type: 'group',
    isOpen: true,
    children: [
      {
        id: 'ellipse-1',
        name: 'Ellipse 1',
        type: 'ellipse',
        object: {
          x: 250,
          y: 100,
          radiusX: 50,
          radiusY: 50,
          fill: 'green',
          stroke: 'black',
          strokeWidth: 2,
        },
      },
      {
        id: 'line-1',
        name: 'Line 1',
        type: 'line',
        object: {
          points: [50, 200, 250, 250],
          stroke: 'blue',
          strokeWidth: 4,
        },
      },
      {
        id: 'arrow-1',
        name: 'Arrow 1',
        type: 'arrow',
        object: {
          points: [300, 50, 400, 150],
          stroke: 'purple',
          fill: 'purple',
          strokeWidth: 4,
          pointerLength: 10,
          pointerWidth: 10,
        },
      },
      {
        id: 'star-1',
        name: 'Star 1',
        type: 'star',
        object: {
          x: 150,
          y: 300,
          numPoints: 5,
          innerRadius: 20,
          outerRadius: 50,
          fill: 'yellow',
          stroke: 'orange',
          strokeWidth: 2,
        },
      },
      {
        id: 'polygon-1',
        name: 'Hexagon 1',
        type: 'polygon',
        object: {
          x: 350,
          y: 300,
          sides: 6,
          radius: 40,
          fill: 'cyan',
          stroke: 'black',
          strokeWidth: 2,
        },
      },
      {
        id: 'triangle-1',
        name: 'Triangle 1',
        type: 'polygon',
        object: {
          x: 450,
          y: 150,
          sides: 3,
          radius: 50,
          fill: 'pink',
          stroke: 'black',
          strokeWidth: 2,
        },
      },
      // {
      //   id: 'image-1',
      //   name: 'Image 1',
      //   type: 'image',
      //   object: {
      //     x: 500,
      //     y: 250,
      //     width: 100,
      //     height: 100,
      //     image: imageElement,
      //   },
      // },
      {
        id: 'text-1',
        name: 'Text 1',
        type: 'text',
        object: {
          x: 100,
          y: 400,
          text: 'Hello Konva!',
          fontSize: 24,
          fill: 'black',
        },
      },
      {
        id: 'pen-1',
        name: 'Pen 1',
        type: 'pen',
        object: {
          points: [50, 450, 100, 470, 150, 440, 200, 460],
          stroke: 'brown',
          strokeWidth: 3,
          lineCap: 'round',
          lineJoin: 'round',
        },
      },
    ],
  },
];