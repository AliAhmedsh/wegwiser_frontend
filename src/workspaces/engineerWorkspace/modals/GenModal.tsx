import React from 'react';
import StarsIcon from '@/shared/icons/StarsIcon';
import DesignPhoneIcon from '@/shared/icons/DesignPhoneIcon';

interface GenModalProps {
    showGenModal: 'none' | 'generating' | 'preview';
    onClose: () => void;
    generatedCode?: string | null;
    error?: string | null;
}

const GenModal: React.FC<GenModalProps> = ({ showGenModal, onClose, generatedCode, error }) => {
    if (showGenModal === 'none') return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50">
            {showGenModal === 'generating' && (
                <div className="bg-white rounded-2xl border border-gray-400 shadow-xl flex flex-col justify-center items-center w-[294px] h-[167px]">
                    <div className="relative w-10 h-10 text-black">
                        <StarsIcon width={20} className="absolute right-2 -top-2" />
                        <StarsIcon />
                    </div>
                    <div className="text-sm font-bold mb-2">Generating code</div>
                    <div className="text-xs font-normal text-black mb-6">Please wait...</div>
                    <button className="text-sm font-bold text-black hover:text-gray-600" onClick={onClose}>
                        Cancel
                    </button>
                </div>
            )}
            {showGenModal === 'preview' && (
                <div className="bg-white rounded-2xl border border-gray-400 shadow-xl flex flex-col w-[90vw] max-w-[800px] h-[80vh] max-h-[600px]">
                    <div className="w-full flex items-center justify-between bg-[#E5E5E5] rounded-t-2xl px-4 py-2 border-b border-gray-400">
                        <span className="text-sm font-bold">Code Preview</span>
                        <button onClick={onClose} className="text-xl text-gray-600 hover:text-black">
                            &#10005;
                        </button>
                    </div>
                    <div className="flex-1 overflow-auto p-4">
                        {error ? (
                            <div className="flex flex-col items-center justify-center h-full">
                                <div className="text-red-600 text-sm font-semibold mb-2">Error</div>
                                <div className="text-xs text-gray-700 text-center bg-red-50 p-4 rounded border border-red-200">
                                    {error}
                                </div>
                            </div>
                        ) : generatedCode ? (
                            <div className="h-full">
                                <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-auto h-full text-xs font-mono whitespace-pre-wrap break-words">
                                    {generatedCode}
                                </pre>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center h-full">
                                <DesignPhoneIcon width={130} />
                                <div className="text-sm text-gray-500 mt-4">No code generated</div>
                            </div>
                        )}
                    </div>
                    {generatedCode && !error && (
                        <div className="w-full flex items-center justify-end gap-2 px-4 py-2 border-t border-gray-300">
                            <button
                                onClick={() => {
                                    navigator.clipboard.writeText(generatedCode);
                                }}
                                className="text-xs px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded border border-gray-300"
                            >
                                Copy Code
                            </button>
                            <button
                                onClick={onClose}
                                className="text-xs px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded"
                            >
                                Close
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default GenModal; 