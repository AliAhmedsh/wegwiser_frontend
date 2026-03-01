import React from 'react';
import { WorkspaceFile } from '../model';
import ArrowDownIcon from '@/shared/icons/ArrowDownIcon';

function ExplorerTree({ files }: { files: WorkspaceFile[] }) {
    return (
        <ul className="pl-2">
            {files.map((file: WorkspaceFile) => (
                <li key={file.id} className="mb-1">
                    <div className="flex items-center gap-1">
                        <div className={`w-6 h-6 flex justify-center items-center ${file.type === 'folder' ? '' : ''}`}>
                            <ArrowDownIcon height={26} />
                        </div>
                        <span className="text-sm text-gray-700">{file.name}</span>
                    </div>
                    {file.children && file.children.length > 0 && (
                        <ExplorerTree files={file.children} />
                    )}
                </li>
            ))}
        </ul>
    );
}

export default ExplorerTree; 