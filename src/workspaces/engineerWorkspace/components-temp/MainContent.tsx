import { WorkspaceFile } from '@/entities/workspace';
import DesignPanel from '@/entities/workspace/ui/DesignPanel';
import ExplorerPanel from '@/entities/workspace/ui/ExplorerPanel';
import PeoplePanel from '@/entities/workspace/ui/PeoplePanel';
import PlusPanel from '@/entities/workspace/ui/PlusPanel';
import AiLogPanel from '@/entities/workspace/ui/StarsPanel';
import React from 'react';

interface MainContentProps {
  activeTab: 'explorer' | 'people' | 'design' | 'stars' | 'plus'; // | 'settings';
  selectedDesignId: number | null;
  onSelectDesign: (id: number | null) => void;
  explorer: WorkspaceFile[];
  width: number;
  isResizing: boolean;
}

const MainContent: React.FC<MainContentProps> = ({
  activeTab,
  selectedDesignId,
  onSelectDesign,
  explorer,
  width,
  isResizing,
}) => {
  return (
    <div
      className="bg-white px-2 overflow-y-auto relative h-[540px]"
      style={{
        width: selectedDesignId !== null ? '100%' : width,
        minWidth: 180,
        maxWidth: selectedDesignId !== null ? '100%' : 500,
        transition: isResizing ? 'none' : 'width 0.2s',
      }}
    >
      {activeTab === 'explorer' && <ExplorerPanel explorer={explorer} />}
      {activeTab === 'people' && <PeoplePanel />}
      {activeTab === 'design' && selectedDesignId === null && (
        <DesignPanel selectedId={selectedDesignId ?? undefined} onSelectDesign={onSelectDesign} />
      )}
      {activeTab === 'stars' && <AiLogPanel />}
      {/* {activeTab === 'settings' && <SettingsPanel />} */}
      {activeTab === 'plus' && <PlusPanel />}
    </div>
  );
};

export default MainContent; 