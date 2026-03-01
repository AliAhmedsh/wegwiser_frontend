import React from 'react';

type SidebarTab =
  | 'explorer'
  | 'people'
  | 'design'
  | 'stars'
  | 'plus'
  // | 'settings'
  | 'filesPreview';

interface PanelHeaderProps {
  activeTab: SidebarTab;
}

const PanelHeader: React.FC<PanelHeaderProps> = ({ activeTab }) => {
  return (
    <div
      className="flex items-center justify-between mb-0 bg-red"
      style={{ minHeight: 48 }}
    >
      <span className="font-semibold text-sm">
        {activeTab === 'explorer' && 'Explorer'}
        {activeTab === 'people' && 'People'}
        {(activeTab === 'design' || activeTab === 'filesPreview') &&
          'Design Files'}
        {activeTab === 'stars' && 'AI Log'}
        {/* {activeTab === 'settings' && 'Settings'} */}
        {activeTab === 'plus' && 'New'}
      </span>
    </div>
  );
};

export default PanelHeader;
