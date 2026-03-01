import React from 'react';

interface GeneratingWireframesModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
}

export default function GeneratingWireframesModal({
  isOpen,
  onClose,
  title = "Generating wireframes",
  subtitle = "Adding components..."
}: GeneratingWireframesModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
      <div className="bg-white rounded-2xl shadow-xl border border-gray-400 px-12 py-4 max-w-[480px] flex flex-col items-center">
        <div className="mb-6">
          <svg xmlns="http://www.w3.org/2000/svg" width="30" height="42" viewBox="0 0 30 42" fill="none">
            <path d="M5.84909 12.7443L14.3242 15.6221L17.1992 24.1082C17.2368 24.2526 17.3675 24.3531 17.5166 24.3531C17.6657 24.3531 17.7964 24.2525 17.834 24.1082L20.709 15.6235L29.1848 12.745C29.3291 12.7067 29.4297 12.576 29.4297 12.4269C29.4297 12.2778 29.3291 12.1471 29.1848 12.1088L20.7097 9.23102L17.834 0.744879C17.7964 0.600547 17.6657 0.5 17.5166 0.5C17.3675 0.5 17.2368 0.600555 17.1992 0.744879L14.3242 9.23032L5.84839 12.1088C5.70406 12.1464 5.60352 12.2771 5.60352 12.4262C5.60352 12.576 5.70407 12.706 5.84839 12.7443L5.84909 12.7443Z" fill="black"/>
            <path d="M8.75009 41.9335C8.85954 41.9348 8.95599 41.8603 8.98334 41.7536L11.095 35.5213L17.3205 33.4077H17.3198C17.4258 33.3797 17.4997 33.2839 17.4997 33.1744C17.4997 33.0643 17.4258 32.9686 17.3198 32.9405L11.095 30.8269L8.98283 24.5946C8.95547 24.4879 8.85971 24.4141 8.74958 24.4141C8.64014 24.4141 8.54437 24.4879 8.51702 24.5946L6.40533 30.8262L0.179893 32.9405C0.0738675 32.9686 0 33.0643 0 33.1738C0 33.2832 0.0738763 33.3797 0.179893 33.407L6.40463 35.5206L8.51632 41.7529L8.517 41.7536C8.54368 41.8603 8.63997 41.9342 8.75009 41.9335Z" fill="black"/>
          </svg>
        </div>
        <h2 className="text-sm font-semibold text-center mb-2">{title}</h2>
        <p className="text-xs font-normal text-center mb-5">{subtitle}</p>
        <button 
          className="text-sm font-semibold text-[#222] cursor-pointer" 
          onClick={onClose}
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
