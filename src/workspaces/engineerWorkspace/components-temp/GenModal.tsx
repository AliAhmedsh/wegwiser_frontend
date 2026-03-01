import React from 'react';
import StarsIcon from '@/shared/icons/StarsIcon';
import DesignPhoneIcon from '@/shared/icons/DesignPhoneIcon';

interface GenModalProps {
    showGenModal: 'none' | 'generating' | 'preview';
    onClose: () => void;
}

const GenModal: React.FC<GenModalProps> = ({ showGenModal, onClose }) => {
    if (showGenModal === 'none') return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
            {showGenModal === 'generating' && (
                <div className="bg-white rounded-2xl border border-gray-400 shadow-xl flex flex-col justify-center items-center w-[294px] h-[167px]">
                    <div className="relative w-10 h-10 text-black">
                        <StarsIcon width={20} className="absolute right-2 -top-2" />
                        <StarsIcon />
                    </div>
                    <div className="text-sm font-bold mb-2">Generating code</div>
                    <div className="text-xs font-normal text-black mb-6">Lorem ipsum...</div>
                    <button className="text-sm font-bold text-black" onClick={onClose}>
                        Cancel
                    </button>
                </div>
            )}
            {showGenModal === 'preview' && (
                <div className="bg-white rounded-2xl border border-gray-400 shadow-xl flex flex-col items-center w-[294px] h-[421px]">
                    <div className="w-full flex items-center justify-between bg-[#E5E5E5] rounded-t-2xl px-3 py-1 border-b border-gray-400">
                        <span className="text-sm font-bold">Code Preview</span>
                        <button onClick={onClose} className="text-xl text-gray-600 hover:text-black">
                            &#10005;
                        </button>
                    </div>
                    <div className="flex flex-col items-center justify-center p-8">
                        <DesignPhoneIcon width={130} />
                    </div>
                </div>
            )}
        </div>
    );
};

export default GenModal; 