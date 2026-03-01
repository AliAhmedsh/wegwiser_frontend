// import React, { useRef } from 'react';
// import dynamic from 'next/dynamic';
// import { AIMessages } from '../types/designWorkspaceTypes';
// import type { CanvasShape, CanvasLine, Phone, CanvasPen } from '../types/canvasTypes';
// import type Konva from 'konva';
//
// const MainCanvasKonva = dynamic(() => import('./MainCanvasKonva'), {
//     ssr: false
// });
//
// interface MainCanvasProps {
//     setShowAIPartner: React.Dispatch<React.SetStateAction<boolean>>;
//     setAIMessages: React.Dispatch<React.SetStateAction<AIMessages>>;
//     stageSize: { width: number; height: number };
//     selectedObject: { type: 'line' | 'shape' | 'phone' | 'pen', id: string } | null;
//     setSelectedObject: (obj: { type: 'line' | 'shape' | 'phone' | 'pen', id: string } | null) => void;
//     shapes: CanvasShape[];
//     setShapes: React.Dispatch<React.SetStateAction<CanvasShape[]>>;
//     lines: CanvasLine[];
//     setLines: React.Dispatch<React.SetStateAction<CanvasLine[]>>;
//     phones: Phone[];
//     setPhones: React.Dispatch<React.SetStateAction<Phone[]>>;
//     pens?: CanvasPen[];
//     setPens?: React.Dispatch<React.SetStateAction<CanvasPen[]>>;
//     stageRef: React.RefObject<Konva.Stage>;
//     selectedMouseTool: 'move' | 'hand' | 'scale';
//     setSelectedMouseTool: React.Dispatch<React.SetStateAction<'move' | 'hand' | 'scale'>>;
// }
//
// export default function MainCanvas({ setShowAIPartner, setAIMessages, stageSize, selectedObject, setSelectedObject, shapes, setShapes, lines, setLines, phones, setPhones, pens, setPens, stageRef, selectedMouseTool, setSelectedMouseTool }: MainCanvasProps) {
//     const containerRef = useRef<HTMLDivElement>(null);
//
//     return (
//         <div ref={containerRef} className="w-full h-full">
//             <MainCanvasKonva
//                 setShowAIPartner={setShowAIPartner}
//                 setAIMessages={setAIMessages}
//                 stageSize={stageSize}
//                 selectedObject={selectedObject}
//                 setSelectedObject={setSelectedObject}
//                 shapes={shapes}
//                 setShapes={setShapes}
//                 lines={lines}
//                 setLines={setLines}
//                 phones={phones}
//                 setPhones={setPhones}
//                 pens={pens}
//                 setPens={setPens}
//                 stageRef={stageRef}
//                 selectedMouseTool={selectedMouseTool}
//                 setSelectedMouseTool={setSelectedMouseTool}
//             />
//         </div>
//     );
// }
