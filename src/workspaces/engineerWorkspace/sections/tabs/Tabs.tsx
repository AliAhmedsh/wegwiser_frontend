import React from 'react';

import { WorkspaceTab } from '@/workspaces/engineerWorkspace/store/store';

import TabClose from '@/assets/icons/TabClose.svg';

interface TabsProps {
  tabs: WorkspaceTab[];
  currentTab: WorkspaceTab | null;
  onTabChange: (tab: WorkspaceTab) => void;
  onTabClose: (tab: WorkspaceTab) => void;
}

const Tabs: React.FC<TabsProps> = ({
  tabs,
  currentTab,
  onTabChange,
  onTabClose,
}) => {
  return (
    <div className="min-h-[32px] flex items-center gap-1 text-xs font-normal px-2 bg-[#EAEDF2] border-b border-gray-200">
      {tabs.map((tab) => {
        const isTabActive = currentTab?.id === tab.id;
        return (
          <div
            key={tab.id}
            className={`p-2 mt-1  flex flex-row gap-1 items-center ${
              isTabActive
                ? 'rounded-tl-[8px] rounded-tr-[8px] bg-[#FFFFFF]'
                : ''
            }`}
          >
            <button
              className="hover:text-gray-700 text-[#181818] font-['Open_Sans'] text-xs font-normal leading-normal"             
              onClick={() => onTabChange(tab)}
            >
              {tab.name}
            </button>
            <TabClose
              onClick={() => onTabClose(tab)}
              className="fill-current text-[#181818] hover:text-[#eb2632]"
            />
          </div>
        );
      })}
    </div>
  );
};

export default Tabs;
