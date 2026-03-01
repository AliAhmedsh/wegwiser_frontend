import { WorkspaceTab } from '@/workspaces/engineerWorkspace/store/store';
import React from 'react';

interface TabsProps {
  tabs: WorkspaceTab[];
  currentTab: WorkspaceTab | null;
  onTabChange: (tab: WorkspaceTab) => void;
}

const Tabs: React.FC<TabsProps> = ({ tabs, currentTab, onTabChange }) => {
  return (
    <div className="min-h-[32px] flex items-center gap-4 text-xs font-normal px-3 py-2 bg-[#F5F6FA] border-b border-gray-200">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          className={`hover:text-gray-700 ${
            currentTab?.id === tab.id
              ? 'text-gray-900 font-medium'
              : 'text-gray-500'
          }`}
          onClick={() => onTabChange(tab)}
        >
          {tab.name}
        </button>
      ))}
    </div>
  );
};

export default Tabs;
