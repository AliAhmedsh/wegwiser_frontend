import React from 'react';
import FolderIcon from '@/shared/icons/FolderIcon';
import UsersIcon from '@/shared/icons/UsersIcon';
import DesignIcon from '@/shared/icons/DesignIcon';
import StarsIcon from '@/shared/icons/StarsIcon';
import PlusIcon from '@/shared/icons/PlusIcon';
import SettingsIcon from '@/shared/icons/SettingsIcon';

interface SidebarProps {
    activeTab: 'explorer' | 'people' | 'design' | 'stars' | 'plus' | 'settings';
    onTabChange: (tab: 'explorer' | 'people' | 'design' | 'stars' | 'plus' | 'settings') => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, onTabChange }) => {
    return (
        <div className="flex flex-col items-center bg-[#627899] border-r border-[#E8E8E8]">
            <button
                className={`flex justify-center items-center w-10 h-10 hover:text-[#535354] hover:bg-gray-100 transition-colors cursor-pointer ${activeTab === 'explorer' ? 'bg-gray-100 text-[#535354]' : 'text-white'}`}
                onClick={() => onTabChange('explorer')}
            >
                <FolderIcon width={24} />
            </button>
            <button
                className={`flex justify-center items-center w-10 h-10 hover:text-[#535354] hover:bg-gray-100 transition-colors cursor-pointer ${activeTab === 'people' ? 'bg-gray-100 text-[#535354]' : 'text-white'}`}
                onClick={() => onTabChange('people')}
            >
                <UsersIcon width={24} />
            </button>
            <button
                className={`flex justify-center items-center w-10 h-10 hover:text-[#535354] hover:bg-gray-100 transition-colors cursor-pointer ${activeTab === 'design' ? 'bg-gray-100 text-[#535354]' : 'text-white'}`}
                onClick={() => onTabChange('design')}
            >
                <DesignIcon width={24} />
            </button>
            <button
                className={`flex justify-center items-center w-10 h-10 hover:text-[#535354] hover:bg-gray-100 transition-colors cursor-pointer ${activeTab === 'stars' ? 'bg-gray-100 text-[#535354]' : 'text-white'}`}
                onClick={() => onTabChange('stars')}
            >
                <StarsIcon width={24} />
            </button>
            <button
                className={`flex justify-center items-center w-10 h-10 hover:text-[#535354] hover:bg-gray-100 transition-colors cursor-pointer ${activeTab === 'plus' ? 'bg-gray-100 text-[#535354]' : 'text-white'}`}
                onClick={() => onTabChange('plus')}
            >
                <PlusIcon width={24} />
            </button>
            <button
                className={`flex justify-center items-center w-10 h-10 hover:text-[#535354] hover:bg-gray-100 transition-colors cursor-pointer ${activeTab === 'settings' ? 'bg-gray-100 text-[#535354]' : 'text-white'}`}
                onClick={() => onTabChange('settings')}
            >
                <SettingsIcon width={24} />
            </button>
        </div>
    );
};

export default Sidebar; 