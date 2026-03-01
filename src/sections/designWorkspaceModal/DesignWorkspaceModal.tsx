// import React, { useState, useEffect, useRef } from 'react';
// import { useDesignWorkspaceModalStore } from '@/entities/designWorkspaceModal/model';
// import LeftSidebar from './sections/LeftSidebar';
// import dynamic from 'next/dynamic';
// import RightSidebar from './sections/RightSidebar';
// import { AIMessages } from './types/designWorkspaceTypes';
// import { StarsIcon } from 'lucide-react';
// import RevisionsModal from './components/RevisionsModal';
// import type { CanvasShape, CanvasLine, Phone, CanvasPen } from './types/canvasTypes';
// import type Konva from 'konva';
//
// const initialAIMessages: AIMessages = [
//     {
//         id: '0',
//         kind: 'text',
//         specialId: 'ai-question',
//         text: 'What are the standard body and heading sizes in mobile UI design?',
//     },
//     {
//         id: '1',
//         kind: 'text',
//         specialId: 'ai-info',
//         text: `<div class='font-normal text-xs'>
//             <div class='font-semibold mb-2'>Text Sizes (iOS & Android Guidelines)</div>
//             <div class='mb-2'>
//                 <div class='font-semibold'>Body Text (Primary content)</div>
//                 <ul class='list-disc pl-5 text-sm'>
//                     <li>16pt / sp (standard readable size)</li>
//                     <li>Accessible and comfortable for most users.</li>
//                 </ul>
//             </div>
//             <div class='font-semibold mt-3'>Headings</div>
//             <ul class='list-disc pl-5 text-sm'>
//                 <li>H1: 24–32pt / sp</li>
//                 <li>H2: 20–24pt / sp</li>
//                 <li>H3: 18–20pt / sp</li>
//             </ul>
//         </div>`
//     },
// ];
//
// const MainCanvas = dynamic(() => import('./components/MainCanvas'), { ssr: false });
//
// export default function DesignWorkspaceModal() {
//     const { isOpen, closeModal } = useDesignWorkspaceModalStore();
//     const [showAIPartner, setShowAIPartner] = useState(false);
//     const [aiMessages, setAIMessages] = useState<AIMessages>(initialAIMessages);
//     const [showWireframeModal, setShowWireframeModal] = useState(false);
//     const [showWcagModal, setShowWcagModal] = useState(false);
//     const containerRef = useRef<HTMLDivElement>(null);
//     const [stageSize, setStageSize] = useState({
//         width: typeof window !== 'undefined' ? window.innerWidth * 0.42 : 800,
//         height: typeof window !== 'undefined' ? window.innerHeight * 0.80 : 600,
//     });
//     const [showRevisionsModal, setShowRevisionsModal] = useState(false);
//     const [selectedObject, setSelectedObject] = useState<{ type: 'line' | 'shape' | 'phone' | 'pen', id: string } | null>(null);
//     const [shapes, setShapes] = useState<CanvasShape[]>([]);
//     const [lines, setLines] = useState<CanvasLine[]>([]);
//     const [phones, setPhones] = useState<Phone[]>([
//         { id: 'phone-1', x: 100, y: 100, width: 130, height: 260 },
//         { id: 'phone-2', x: 300, y: 100, width: 130, height: 260 },
//     ]);
//     const [pens, setPens] = useState<CanvasPen[]>([]);
//     const stageRef = useRef<Konva.Stage>(null);
//     const [selectedMouseTool, setSelectedMouseTool] = useState<'move' | 'hand' | 'scale'>('move');
//
//     useEffect(() => {
//         if (showWireframeModal) {
//             const timer = setTimeout(() => setShowWcagModal(true), 2000);
//             return () => clearTimeout(timer);
//         } else {
//             setShowWcagModal(false);
//         }
//     }, [showWireframeModal]);
//
//     useEffect(() => {
//         function updateSize() {
//             if (containerRef.current) {
//                 const width = containerRef.current.offsetWidth;
//                 const height = containerRef.current.offsetHeight;
//                 if (width > 0 && height > 0) {
//                     setStageSize({ width, height });
//                 }
//             }
//         }
//
//         requestAnimationFrame(updateSize);
//
//         const resizeObserver = new ResizeObserver(() => {
//             requestAnimationFrame(updateSize);
//         });
//
//         if (containerRef.current) {
//             resizeObserver.observe(containerRef.current);
//         }
//
//         return () => {
//             resizeObserver.disconnect();
//         };
//     }, []);
//
//     useEffect(() => {
//         if (isOpen) setShowRevisionsModal(true);
//     }, [isOpen]);
//
//     const handleAIPartnerOption = (option: string) => {
//         if (option === 'Generate wireframes') {
//             setAIMessages(prev => [
//                 ...prev,
//                 { id: Date.now().toString(), kind: 'text', text: 'Generating wireframes...' },
//             ]);
//             setShowWireframeModal(true);
//         }
//     };
//
//     if (!isOpen) return null;
//
//     return (
//         <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
//             <div className="relative h-[90vh] w-[80vw] bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col">
//                 <div className="flex items-center p-5 bg-white w-full border-b border-[#E8E8E8]">
//                     <div className="cursor-pointer text-[#627899]" onClick={closeModal}>
//                         <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#627899" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
//                     </div>
//                     <h2 className="text-base font-semibold ml-4">Design Workspace</h2>
//                 </div>
//                 <div className="flex flex-1 min-h-0 bg-[#EAEDF2]">
//                     <LeftSidebar
//                         shapes={shapes}
//                         lines={lines}
//                         phones={phones}
//                         pens={pens}
//                         selectedObject={selectedObject}
//                         setSelectedObject={setSelectedObject}
//                         setShapes={setShapes}
//                         setLines={setLines}
//                         setPhones={setPhones}
//                         setPens={setPens}
//                     />
//                     <div ref={containerRef}
//                         className="flex-1 flex flex-col">
//                         <MainCanvas
//                             setShowAIPartner={setShowAIPartner}
//                             setAIMessages={setAIMessages}
//                             stageSize={stageSize}
//                             selectedObject={selectedObject}
//                             setSelectedObject={setSelectedObject}
//                             shapes={shapes}
//                             setShapes={setShapes}
//                             lines={lines}
//                             setLines={setLines}
//                             phones={phones}
//                             setPhones={setPhones}
//                             pens={pens}
//                             setPens={setPens}
//                             stageRef={stageRef}
//                             selectedMouseTool={selectedMouseTool}
//                             setSelectedMouseTool={setSelectedMouseTool}
//                         />
//                     </div>
//                     <RightSidebar
//                         showAIPartner={showAIPartner}
//                         aiMessages={aiMessages}
//                         onAIPartnerOption={handleAIPartnerOption}
//                         setAIMessages={setAIMessages}
//                         selectedObject={selectedObject}
//                         shapes={shapes}
//                         setShapes={setShapes}
//                         lines={lines}
//                         setLines={setLines}
//                         phones={phones}
//                         setPhones={setPhones}
//                         pens={pens}
//                         setPens={setPens}
//                         stageRef={stageRef}
//                     />
//                 </div>
//                 {showWireframeModal && (
//                     <div className="fixed inset-0 z-50 flex items-center justify-center">
//                         <div className="bg-white rounded-2xl shadow-xl border border-gray-400 px-12 py-4 max-w-[420px] flex flex-col items-center">
//                             <div className="mb-6">
//                                 <StarsIcon />
//                             </div>
//                             <h2 className="text-sm font-semibold text-center mb-2">Generating wireframes</h2>
//                             <p className="text-xs font-normal text-center mb-6">Adding components…</p>
//                             <button className="text-sm text-[#222] cursor-pointer" onClick={() => setShowWireframeModal(false)}>Cancel</button>
//                         </div>
//                     </div>
//                 )}
//                 {showWcagModal && (
//                     <div className="fixed inset-0 z-50 flex items-center justify-center">
//                         <div className="bg-white rounded-2xl shadow-xl border border-[#535354]/20 p-6 max-w-[315px] flex flex-col items-center">
//                             <h2 className="text-base font-semibold text-center mb-6">Attention</h2>
//                             <p className="text-xs font-normal text-center mb-10">The screen you designed does not comply with WCAG 2.1 standards. Would you like to generate a correction?</p>
//                             <div className="flex w-full justify-between items-center mt-4 gap-8">
//                                 <button className="text-sm font-bold cursor-pointer" onClick={() => setShowWcagModal(false)}>No</button>
//                                 <button className="text-sm font-bold bg-black text-white rounded-2xl px-10 py-3 cursor-pointer" onClick={() => setShowWcagModal(false)}>Yes</button>
//                             </div>
//                         </div>
//                     </div>
//                 )}
//             </div>
//             <RevisionsModal open={showRevisionsModal} onClose={() => setShowRevisionsModal(false)} />
//         </div>
//     );
// }
