import React from 'react';
import ArrowBackIcon from '@/shared/icons/ArrowBackIcon';
import PlayIcon from '@/shared/icons/PlayIcon';
import SideBarIcon from '@/shared/icons/SideBarIcon';

interface HeaderProps {
    onClose: () => void;
    aiCollapsed: boolean;
    onToggleAI: () => void;
}

const Header: React.FC<HeaderProps> = ({ onClose, aiCollapsed, onToggleAI }) => {
    return (
        <div className="flex gap-4 items-center justify-between p-5 bg-white w-full border-b border-[#E8E8E8]">
            <div className='flex items-center justify-center gap-4'>
                <div className="cursor-pointer text-[#627899]" onClick={onClose}>
                    <ArrowBackIcon height={24} />
                </div>
                <h2 className="text-base font-semibold">Engineering Workspace</h2>
            </div>
            <div className="flex items-center gap-2 mr-2">
                <button className="flex justify-center items-center w-6 h-6 rounded-sm hover:bg-gray-200 cursor-pointer">
                    <PlayIcon width={24} className="text-[#343330]" />
                </button>
                <button
                    className={`flex justify-center items-center w-6 h-6 rounded-sm hover:bg-gray-200 cursor-pointer ${!aiCollapsed && 'bg-gray-300'
                        }`}
                    onClick={onToggleAI}
                >
                    <SideBarIcon height={24} className="text-[#343330]" />
                </button>
            </div>
        </div>
    );
};

export default Header; 