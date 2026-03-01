import React from 'react';

interface ConsoleProps {
    height: number;
    isResizing: boolean;
    onResize: (e: React.MouseEvent) => void;
}

const Console: React.FC<ConsoleProps> = ({ height, isResizing, onResize }) => {
    return (
        <>
            <div
                onMouseDown={onResize}
                className="h-1 cursor-ns-resize bg-white hover:bg-gray-500 transition"
                style={{ zIndex: 10 }}
            />
            <div
                style={{
                    height,
                    minHeight: 120,
                    maxHeight: 400,
                    transition: isResizing ? 'none' : 'height 0.2s',
                }}
                className="bg-[#444] border-t border-gray-300 rounded-b-xl flex flex-col"
            >
                <div className="flex items-center gap-4 text-white text-xs font-normal px-3 py-2 border-b border-gray-400">
                    <span>Problems</span>
                    <span>Output</span>
                    <span>Debug Console</span>
                    <span>Ports</span>
                    <span>Comments</span>
                </div>
                <div className="flex-1 flex flex-col gap-8 justify-center px-24 py-8">
                    <div className="h-10 bg-gray-400 rounded w-3/4" />
                    <div className="h-10 bg-gray-400 rounded w-2/3" />
                    <div className="h-10 bg-gray-400 rounded w-full" />
                </div>
            </div>
        </>
    );
};

export default Console; 