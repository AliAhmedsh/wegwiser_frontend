import React from 'react';
import SearchIcon from '@/shared/icons/SearchIcon';
import { WorkspaceFile } from '../model';
import ExplorerTree from './ExplorerTree';

interface ExplorerPanelProps {
    explorer: WorkspaceFile[];
}

const ExplorerPanel: React.FC<ExplorerPanelProps> = ({ explorer }) => (
    <div className="bg-white overflow-y-auto relative">
        <div className="relative h-9 w-full mb-7 ">
            <input
                type="text"
                className="text-sm h-full w-full border-1 border-gray-400 rounded-md p-1 pr-10"
            />
            <div className="absolute top-[25%] right-4 text-gray-500 pointer-events-none">
                <SearchIcon width={18} />
            </div>
        </div>
        <ExplorerTree files={explorer} />
    </div>
);

export default ExplorerPanel; 