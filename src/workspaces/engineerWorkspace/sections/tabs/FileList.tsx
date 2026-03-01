import React from 'react';
import { WorkspaceFile } from '@/workspaces/engineerWorkspace/store/store';

interface FileListProps {
  currentFile: WorkspaceFile | null;
  explorer: WorkspaceFile[];
  onFileSelect: (file: WorkspaceFile) => void;
}

const FileList: React.FC<FileListProps> = ({
  currentFile,
  explorer,
}) => {

  const findFilePath = (targetFile: WorkspaceFile, files: WorkspaceFile[], path: string[] = []): string[] | null => {
    for (const file of files) {
      const currentPath = [...path, file.name];
      
      if (file.id === targetFile.id) {
        return currentPath;
      }
      
      if (file.type === 'folder' && file.children) {
        const result = findFilePath(targetFile, file.children, currentPath);
        if (result) return result;
      }
    }
    return null;
  };

  const getFilePath = () => {
    if (!currentFile) return null;
    return findFilePath(currentFile, explorer);
  };

  const filePath = getFilePath();

  if (!filePath) {
    return null;
  }

  return (
    <div className="bg-[#EAEDF2] border-b border-gray-200 px-2 py-1">
      <div className="flex items-center gap-1 text-xs text-gray-500 pl-2" style={{
        fontSize: '12px',
        fontStyle: 'normal',
        fontWeight: 400,
        lineHeight: 'normal'
      }}>
        {filePath.map((segment, index) => (
          <React.Fragment key={index}>
            <span className="text-[#181818]">{segment}</span>
            {index < filePath.length - 1 && (
              <svg className="w-3.5 h-3.5 mt-[0.7px]" fill="var(--Body-text, #181818)" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

export default FileList; 