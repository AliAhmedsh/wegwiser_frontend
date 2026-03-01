import { useDesignWorkspaceModalStore } from '@/entities/designWorkspaceModal/model';
import { useProductStore } from '@/entities/product/store';
import RightSidebar from '@/workspaces/designWorkspace/sections/RightSideBar/RightSidebar';
import { useDesignWorkspaceStore } from '@/workspaces/designWorkspace/store/designWorkspace.store';
import type Konva from 'konva';
import dynamic from 'next/dynamic';
import { useEffect, useRef, useState } from 'react';
import LeftSidebar from './sections/LeftSideBar/LeftSidebar';
import AIChatWithCritique from './components/AIChatWithCritique/AIChatWithCritique';
import CanvasOperationsPanel from './components/CanvasOperations/CanvasOperationsPanel';

const MainCanvasKonva = dynamic(
  () =>
    import(
      '@/workspaces/designWorkspace/components/MainCanvasKonva/MainCanvasKonva'
    ),
  { ssr: false }
);

export default function DesignWorkspaceModal() {
  const { isOpen, closeModal } = useDesignWorkspaceModalStore();
  const { chosenProduct } = useProductStore();
  const containerRef = useRef<HTMLDivElement>(null);
  // const [showRevisionsModal, setShowRevisionsModal] = useState(false);
  const stageRef = useRef<Konva.Stage>(null);
  const setStageSize = useDesignWorkspaceStore((state) => state.setStageSize);
  const [showAIPartner, setShowAIPartner] = useState(false);
  const [showCanvasOperations, setShowCanvasOperations] = useState(false);

  useEffect(() => {
    if (!isOpen || !chosenProduct) {
      return;
    }

    const updateStageSize = () => {
      if (!containerRef.current) return;
      const { clientWidth, clientHeight } = containerRef.current;
      const calculatedWidth = Math.max(900, clientWidth - 32);
      const calculatedHeight = Math.max(600, clientHeight - 140);
      setStageSize({ width: calculatedWidth, height: calculatedHeight });
    };

    updateStageSize();

    if (!containerRef.current) {
      return;
    }

    let resizeObserver: ResizeObserver | null = null;

    if (typeof ResizeObserver !== 'undefined') {
      resizeObserver = new ResizeObserver(() => {
        updateStageSize();
      });
      resizeObserver.observe(containerRef.current);
    }

    window.addEventListener('resize', updateStageSize);

    return () => {
      resizeObserver?.disconnect();
      window.removeEventListener('resize', updateStageSize);
    };
  }, [isOpen, chosenProduct, setStageSize]);

  // useEffect(() => {
  //   const wasChanged = false
  //   if (wasChanged) setShowRevisionsModal(true);
  // }, [isOpen]);

  if (!isOpen) return null;

  // Check if a product is selected
  if (!chosenProduct) {
    return (
      <div className="fixed inset-0 z-5 flex items-center justify-center bg-black/30">
        <div className="relative h-auto w-[400px] bg-white rounded-2xl shadow-2xl p-8 flex flex-col items-center gap-4">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" fill="#FFA500" />
          </svg>
          <h3 className="text-xl font-semibold text-gray-900">No Product Selected</h3>
          <p className="text-center text-gray-600">
            Please select a product before opening the Design Workspace.
          </p>
          <button
            onClick={closeModal}
            className="mt-4 px-6 py-2 bg-[#627899] text-white rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    );
  }
  return (
    <div className="fixed inset-0 z-5 flex items-center justify-center bg-black/30">
      <div className="relative h-[90vh] w-[80vw] bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-5 bg-white w-full border-b border-[#E8E8E8]">
          <div className="flex items-center cursor-pointer" onClick={closeModal}>
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <g clipPath="url(#clip0_495_6551)">
                <path
                  d="M11.67 4.36961L9.9 2.59961L0 12.4996L9.9 22.3996L11.67 20.6296L3.54 12.4996L11.67 4.36961Z"
                  fill="#627899"
                />
              </g>
              <defs>
                <clipPath id="clip0_495_6551">
                  <rect width="24" height="24" fill="white" transform="translate(0 0.5)" />
                </clipPath>
              </defs>
            </svg>
            <h2 className="text-base font-semibold ml-4">Design Workspace</h2>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowCanvasOperations(!showCanvasOperations)}
              className="px-4 py-2 bg-[#627899] text-white rounded-lg hover:bg-[#4a5d7a] transition-colors text-sm font-medium flex items-center gap-2"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z" fill="currentColor"/>
              </svg>
              {showCanvasOperations ? 'Close Canvas Ops' : 'Canvas Ops'}
            </button>
            <button
              onClick={() => setShowAIPartner(!showAIPartner)}
              className="px-4 py-2 bg-[#627899] text-white rounded-lg hover:bg-[#4a5d7a] transition-colors text-sm font-medium flex items-center gap-2"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" fill="currentColor"/>
              </svg>
              {showAIPartner ? 'Close AI Partner' : 'Open AI Partner'}
            </button>
          </div>
        </div>
        <div className="flex flex-1 items-stretch min-h-0 bg-[#D5DBE3] gap-3 px-3 py-2 overflow-hidden">
          <LeftSidebar />
          <div
            ref={containerRef}
            className="flex-1 min-w-0 h-full flex flex-col bg-[#D5DBE3] rounded-xl overflow-hidden"
          >
            <MainCanvasKonva stageRef={stageRef} />
          </div>
          {/* Right Sidebar - Properties Panel */}
          <RightSidebar stageRef={stageRef} />
          
          {/* Canvas Operations Panel */}
          {showCanvasOperations && (
            <div className="h-full bg-[#D5DBE3] flex flex-col p-2 w-[340px] flex-shrink-0 rounded-xl">
              <div className="bg-white h-full rounded-xl overflow-hidden">
                <CanvasOperationsPanel onClose={() => setShowCanvasOperations(false)} />
              </div>
            </div>
          )}
          
          {/* AI Partner Panel - same level as RightSidebar, shows alongside it */}
          {showAIPartner && (
            <div className="h-full bg-[#D5DBE3] flex flex-col p-2 w-[300px] flex-shrink-0 rounded-xl ai-chat-workspace-wrapper">
              <div className="bg-white h-full rounded-xl overflow-hidden">
                <AIChatWithCritique onClose={() => setShowAIPartner(false)} />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
