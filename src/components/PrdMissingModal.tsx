import React from 'react';
import Modal from '@/shared/portals/ModalWindow';
import Image from 'next/image';

type PrdMissingModalMode = 'prd-missing' | 'items-missing';

interface PrdMissingModalProps {
    isOpen: boolean;
    onClose?: () => void;
    onConfirm: () => void;
    onCancel?: () => void; // For "No" button in prd-missing mode
    mode?: PrdMissingModalMode;
}

const PrdMissingModal: React.FC<PrdMissingModalProps> = ({ isOpen, onClose, onConfirm, onCancel, mode = 'prd-missing' }) => {
    if (!isOpen) return null;

    const isPrdMissingMode = mode === 'prd-missing';
    const heading = isPrdMissingMode ? 'PRD missing' : 'Items missing';
    const text = isPrdMissingMode 
        ? 'Would you like to generate a PRD outline based on the product?'
        : 'Please upload product docs if you would like me to generate a PRD outline based on the product.';

    return (
        <Modal isOpen={isOpen} onClose={onClose || onConfirm} noDimming={true}>
            <div className="bg-white rounded-2xl shadow-xl border border-[#858585] p-6 flex flex-col items-center justify-center text-center max-w-sm mx-auto">
                {/* Stars Icon */}
                <div className="mb-6">
                    <Image
                        src="/icons/Stars.svg"
                        alt="stars"
                        width={28}
                        height={28}
                    />
                </div>

                <h2 className="text-sm font-bold mb-4 text-black">{heading}</h2>
                <p className="text-xs font-normal text-[#000000] mb-8">
                    {text}
                </p>

                {isPrdMissingMode ? (
                    // PRD missing mode: Show "No" and "Yes" buttons
                    <div className="flex w-full justify-center items-center gap-4">
                        <button
                            className="text-sm font-semibold bg-white text-black border border-black py-3 px-10 rounded-xl hover:bg-gray-100 transition-colors"
                            onClick={onCancel || onClose}
                        >
                            No
                        </button>
                        <button
                            className="text-sm font-semibold bg-black text-white py-3 px-10 rounded-xl hover:bg-gray-800 transition-colors"
                            onClick={onConfirm}
                        >
                            Yes
                        </button>
                    </div>
                ) : (
                    // Items missing mode: Show only "OK" button
                <div className="flex w-full justify-center items-center">
                    <button
                        className="text-sm font-semibold bg-black text-white py-3 px-10 rounded-xl hover:bg-gray-800 transition-colors"
                        onClick={onConfirm}
                    >
                        OK
                    </button>
                </div>
                )}
            </div>
        </Modal>
    );
};

export default PrdMissingModal;

