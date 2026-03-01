import DesignIcon from '@/shared/icons/DesignIcon';
import FolderIcon from '@/shared/icons/FolderIcon';
import PlusIcon from '@/shared/icons/PlusIcon';
import StarsIcon from '@/shared/icons/StarsIcon';
import UsersIcon from '@/shared/icons/UsersIcon';
import React from 'react';

type SidebarTab =
  | 'explorer'
  | 'people'
  | 'design'
  | 'stars'
  | 'plus'
  // | 'settings'
  | 'filesPreview';

interface SidebarProps {
  activeTab: SidebarTab;
  onTabChange: (tab: SidebarTab) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, onTabChange }) => {
  return (
    <div className="flex flex-col items-center pt-3 bg-[#627899] border-r border-[#E8E8E8] font-opensans">
      <button
        className={`flex justify-center items-center w-10 h-7 hover:text-[#535354] hover:bg-gray-100 transition-colors cursor-pointer ${activeTab === 'explorer' ? 'bg-gray-100 text-[#535354]' : 'text-white'
          }`}
        onClick={() => onTabChange('explorer')}
      >
        <FolderIcon width={24} />
      </button>
      <button
        className={`flex justify-center items-center w-10 h-7 hover:text-[#535354] hover:bg-gray-100 transition-colors cursor-pointer ${activeTab === 'people' ? 'bg-gray-100 text-[#535354]' : 'text-white'
          }`}
        onClick={() => onTabChange('people')}
      >
        <UsersIcon width={24} />
      </button>
      <button
        className={`flex justify-center items-center w-10 h-7 hover:text-[#535354] hover:bg-gray-100 transition-colors cursor-pointer ${activeTab === 'design' ? 'bg-gray-100 text-[#535354]' : 'text-white'
          }`}
        onClick={() => onTabChange('design')}
      >
        <DesignIcon className='mt-1.5 ml-1 ' width={24} height={24} />
      </button>
      {/* <button
        className={`flex justify-center items-center w-10 h-7 hover:text-[#535354] hover:bg-gray-100 transition-colors cursor-pointer ${
          activeTab === 'settings' ? 'bg-gray-100 text-[#535354]' : 'text-white'
        }`}
        onClick={() => onTabChange('settings')}
      >
        <SettingsIcon width={24} />
      </button> */}
      <button
        className={`flex justify-center items-center relative w-10 h-7 hover:text-[#535354] hover:bg-gray-100 transition-colors cursor-pointer ${activeTab === 'stars' ? 'bg-gray-100 text-[#535354]' : 'text-white'
          }`}
        onClick={() => onTabChange('stars')}
      >
        <div className="relative w-6 h-6">
          <StarsIcon width={12} className="absolute top-2 left-0" />
          <StarsIcon width={16} className="absolute top-0 left-1.5" />
        </div>
      </button>

      <button
        className={`flex justify-center items-center w-10 h-7 hover:text-[#535354] hover:bg-gray-100 transition-colors cursor-pointer ${activeTab === 'plus' ? 'bg-gray-100 text-[#535354]' : 'text-white'
          }`}
        onClick={() => onTabChange('plus')}
      >
        <PlusIcon width={24} />
      </button>
    </div>
  );
};

export default Sidebar;
