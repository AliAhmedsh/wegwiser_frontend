import React from 'react';

interface WorkspaceTab {
    id: string;
    name: string;
}

interface TabsProps {
    tabs: WorkspaceTab[];
    currentTabId: string | null;
    onTabChange: (tabId: string) => void;
}

const Tabs: React.FC<TabsProps> = ({ tabs, currentTabId, onTabChange }) => {
    return (
        <div className="flex items-center gap-4 text-xs font-normal px-3 py-2 bg-[#F5F6FA] border-b border-gray-200">
            {tabs.map((tab) => (
                <button
                    key={tab.id}
                    className={`hover:text-gray-700 ${currentTabId === tab.id ? 'text-gray-900 font-medium' : 'text-gray-500'
                        }`}
                    onClick={() => onTabChange(tab.id)}
                >
                    {tab.name}
                </button>
            ))}
        </div>
    );
};

export default Tabs; 