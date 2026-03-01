import React from 'react';
import SearchIcon from '@/shared/icons/SearchIcon';

const MOCK_DESIGNS = [
    { id: 1, title: 'Search UI – Draft', subtitle: 'Vehicle details' },
    { id: 2, title: 'Search UI – Draft', subtitle: 'Vehicle details' },
    { id: 3, title: 'Search UI – Draft', subtitle: 'Vehicle details' },
    { id: 4, title: 'Search UI – Draft', subtitle: 'Vehicle details' },
    { id: 5, title: 'Search UI – Draft', subtitle: 'Vehicle details' },
    { id: 6, title: 'Search UI – Draft', subtitle: 'Vehicle details' },

];

interface DesignPanelProps {
    selectedId?: number;
    onSelectDesign?: (id: number) => void;
}

const DesignPanel: React.FC<DesignPanelProps> = ({ selectedId, onSelectDesign }) => (
    <div className="flex h-full flex-col gap-3">
        <div className="relative h-9 w-full">
        <input
          type="text"
          className="text-sm h-full w-full border border-gray-400 rounded-md p-1 pr-10"
        />
        <div className="absolute top-[25%] right-4 text-gray-500 pointer-events-none">
          <SearchIcon width={18} />
        </div>
      </div>
      <div className="flex flex-col gap-4 pr-2 h-120 overflow-hidden overflow-y-auto">
      {MOCK_DESIGNS.map(d => (
          <div
            key={d.id}
            className={`mb-2 cursor-pointer ${selectedId === d.id ? 'ring-2 ring-[#627899] bg-[#F5F6FA]' : ''}`}
                    onClick={() => onSelectDesign && onSelectDesign(d.id)}
          >
                    <div className="w-full h-28 rounded-xl mb-2" style={{
                background: `
                  repeating-conic-gradient(
                    #eee 0% 25%,
                    #ddd 0% 50%
                  )
                `,
                backgroundSize: '24px 24px',
              }} />
            <p className="font-semibold text-sm leading-tight">{d.title}</p>
            <p className="text-gray-500 text-xs font-normal">{d.subtitle}</p>
          </div>
        ))}
      </div>
    </div>
  );
  
export default DesignPanel; 