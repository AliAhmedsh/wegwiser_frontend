import React from 'react';

interface PanelHeaderProps {
    activeTab: 'explorer' | 'people' | 'design' | 'stars' | 'plus' | 'settings';
}

const PanelHeader: React.FC<PanelHeaderProps> = ({ activeTab }) => {
    return (
        <div className="flex items-center justify-between mb-0 bg-white" style={{ minHeight: 48 }}>
            <span className="font-semibold text-sm">
                {activeTab === 'explorer' && 'Explorer'}
                {activeTab === 'people' && 'Explorer'}
                {activeTab === 'design' && 'Design'}
                {activeTab === 'stars' && 'AI Log'}
                {activeTab === 'settings' && 'Settings'}
                {activeTab === 'plus' && 'New'}
            </span>
        </div>
    );
};

export default PanelHeader; 