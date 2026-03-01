import React from 'react';
import Modal from '@/shared/portals/ModalWindow';

interface GeneratePrdOutlineModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
}

const GeneratePrdOutlineModal: React.FC<GeneratePrdOutlineModalProps> = ({ isOpen, onClose, onConfirm }) => {
    if (!isOpen) return null;

    return (
        <Modal isOpen={isOpen} onClose={onClose} noDimming={true}>
            <div className="bg-white rounded-2xl shadow-xl border border-[#858585] p-6 flex flex-col items-center justify-center text-center max-w-sm mx-auto">
                {/* Stars Icon */}
                <div className="mb-6">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="0" strokeLinecap="round" strokeLinejoin="round" className="text-black">
                        <path d="M12 .587l3.692 7.568L24 9.76l-6 5.852 1.42 8.28L12 18.897l-7.42 4.095L6 15.612 0 9.76l8.308-1.605L12 .587z" />
                    </svg>
                </div>

                <h2 className="text-sm font-bold mb-4 text-black">{`Let's get things started!`}</h2>
                <p className="text-xs font-normal text-gray-700 mb-8">
                    Would you like to generate a PRD outline
                    <br />based on the product?
                </p>

                <div className="flex w-full justify-between items-center">
                    <button
                        className="text-sm font-semibold text-black py-3 px-6 rounded-xl hover:bg-gray-100 transition-colors"
                        onClick={onClose}
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
            </div>
        </Modal>
    );
};

export default GeneratePrdOutlineModal; 