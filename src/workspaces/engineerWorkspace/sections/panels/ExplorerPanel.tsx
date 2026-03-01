import React, { useEffect, useState } from 'react';

import { Input } from '@/components/ui/input';

import SearchIcon from '@/shared/icons/SearchIcon';
import { WorkspaceFile, useWorkspaceStore } from '../../store/store';
import ExplorerTree from './ExplorerTree';
import RenameDialog from './RenameDialog';
import { useProductStore } from '@/entities/product/store';
import { useSelectedVehicleStore } from '@/entities/vehicle/selectedVehicleStore';
import { engineeringFilesService } from '@/entities/tickets/api/engineeringFilesService';
import { showToast } from '@/lib/utils/toast';

interface ExplorerPanelProps {
  explorer: WorkspaceFile[];
  onTabAdd: (file: WorkspaceFile) => void;
  currentFile?: WorkspaceFile | null;
}

const ExplorerPanel: React.FC<ExplorerPanelProps> = ({
  explorer,
  onTabAdd,
  currentFile,
}) => {
  // const [searchTerm, setSearchTerm] = useState<string>('');
  const [filesTree, setFilesTree] = useState<WorkspaceFile[]>(explorer);
  const [renameDialog, setRenameDialog] = useState<{
    isOpen: boolean;
    file: WorkspaceFile | null;
  }>({
    isOpen: false,
    file: null,
  });
  
  const { chosenProduct } = useProductStore();
  const { selectedVehicleId } = useSelectedVehicleStore();
  const { addFile, addFolder, updateFile, deleteFile } = useWorkspaceStore();


  useEffect(() => {
    setFilesTree(explorer);
  }, [explorer]);

  
  const onSearchInput = (e: React.FormEvent<HTMLInputElement>) => {

    const searchTerm = e.currentTarget.value.trim().toLowerCase();
    const filteredFilesTree = filterFiles(explorer, searchTerm);

    setFilesTree(filteredFilesTree);
  };

  const filterFiles = (
    files: WorkspaceFile[],
    searchTerm: string
  ): WorkspaceFile[] => {


    return files
      .map((file) => {
        const nameMatches =
          file.type === 'file' && file.name.toLowerCase().includes(searchTerm);
        const children = file.children
          ? filterFiles(file.children, searchTerm)
          : [];

      
        if (nameMatches || children.length > 0) {
          return {
            ...file,
            children,
          };
        }

        return null;
      })
      .filter(Boolean) as WorkspaceFile[];
  };

  const handleCreateFile = async (name: string, parentId?: string) => {
    if (!chosenProduct?.id || !selectedVehicleId) {
      showToast.error('Product and vehicle must be selected');
      return;
    }

    try {
      const content = getDefaultContent(name);
      const response = await engineeringFilesService.createFile(chosenProduct.id, {
        name,
        type: 'file',
        parentId: parentId || undefined,
        content,
        vehicleId: selectedVehicleId
      });

      if (response.success && response.file) {
        // Convert backend file to frontend format
        const newFile: WorkspaceFile = {
          id: response.file.id.toString(),
          name: response.file.name,
          type: response.file.type as 'file' | 'folder',
          content: response.file.content,
        };
        addFile(newFile, parentId);
        setFilesTree(explorer);
        showToast.success('File created successfully');
      } else {
        showToast.error(response.error || 'Failed to create file');
      }
    } catch (error) {
      console.error('Error creating file:', error);
      showToast.error('Failed to create file');
    }
  };

  const handleCreateFolder = async (name: string, parentId?: string) => {
    if (!chosenProduct?.id || !selectedVehicleId) {
      showToast.error('Product and vehicle must be selected');
      return;
    }

    try {
      const response = await engineeringFilesService.createFile(chosenProduct.id, {
        name,
        type: 'folder',
        parentId: parentId || undefined,
        vehicleId: selectedVehicleId
      });

      if (response.success && response.file) {
        // Convert backend file to frontend format
        const newFolder: WorkspaceFile = {
          id: response.file.id.toString(),
          name: response.file.name,
          type: response.file.type as 'file' | 'folder',
          children: [],
        };
        addFolder(newFolder, parentId);
        setFilesTree(explorer);
        showToast.success('Folder created successfully');
      } else {
        showToast.error(response.error || 'Failed to create folder');
      }
    } catch (error) {
      console.error('Error creating folder:', error);
      showToast.error('Failed to create folder');
    }
  };

  const getDefaultContent = (fileName: string): string => {
    const extension = fileName.split('.').pop()?.toLowerCase();
    switch (extension) {
      case 'js':
      case 'jsx':
        return '// New JavaScript file\nconsole.log("Hello, World!");';
      case 'ts':
      case 'tsx':
        return '// New TypeScript file\nconsole.log("Hello, World!");';
      case 'py':
        return '# New Python file\nprint("Hello, World!")';
      case 'css':
        return '/* New CSS file */\nbody {\n  margin: 0;\n  padding: 0;\n}';
      case 'scss':
        return '/* New SCSS file */\nbody {\n  margin: 0;\n  padding: 0;\n}';
      case 'html':
        return '<!DOCTYPE html>\n<html>\n<head>\n  <title>New HTML File</title>\n</head>\n<body>\n  <h1>Hello, World!</h1>\n</body>\n</html>';
      case 'json':
        return '{\n  "name": "new-file",\n  "version": "1.0.0"\n}';
      case 'md':
        return '# New Markdown File\n\nWrite your content here.';
      case 'java':
        return 'public class NewFile {\n    public static void main(String[] args) {\n        System.out.println("Hello, World!");\n    }\n}';
      case 'cpp':
      case 'c':
        return '#include <iostream>\n\nint main() {\n    std::cout << "Hello, World!" << std::endl;\n    return 0;\n}';
      case 'php':
        return '<?php\n// New PHP file\necho "Hello, World!";\n?>';
      case 'rb':
        return '# New Ruby file\nputs "Hello, World!"';
      case 'go':
        return 'package main\n\nimport "fmt"\n\nfunc main() {\n    fmt.Println("Hello, World!")\n}';
      case 'rs':
        return 'fn main() {\n    println!("Hello, World!");\n}';
      case 'swift':
        return 'import Foundation\n\nprint("Hello, World!")';
      case 'kt':
        return 'fun main() {\n    println("Hello, World!")\n}';
      default:
        return '// New file';
    }
  };

  const handleRename = (fileId: string) => {
   
    const findFile = (files: WorkspaceFile[], id: string): WorkspaceFile | null => {
      for (const file of files) {
        if (file.id === id) return file;
        if (file.children) {
          const found = findFile(file.children, id);
          if (found) return found;
        }
      }
      return null;
    };

    const fileToRename = findFile(filesTree, fileId);
    if (fileToRename) {
      setRenameDialog({
        isOpen: true,
        file: fileToRename,
      });
    }
  };

  const handleRenameConfirm = async (newName: string) => {
    if (!renameDialog.file || !chosenProduct?.id || !selectedVehicleId) {
      setRenameDialog({ isOpen: false, file: null });
      return;
    }

    // Check if file has backend ID (numeric ID means it's from backend)
    const fileId = parseInt(renameDialog.file.id);
    if (isNaN(fileId)) {
      // Local file, just update in store
      updateFile(renameDialog.file.id, { name: newName });
      setRenameDialog({ isOpen: false, file: null });
      return;
    }

    try {
      const response = await engineeringFilesService.updateFile(fileId, {
        name: newName,
        vehicleId: selectedVehicleId
      });

      if (response.success && response.file) {
        updateFile(renameDialog.file.id, { name: newName });
        setFilesTree(explorer);
        showToast.success('File renamed successfully');
      } else {
        showToast.error(response.error || 'Failed to rename file');
      }
    } catch (error) {
      console.error('Error renaming file:', error);
      showToast.error('Failed to rename file');
    }

    setRenameDialog({ isOpen: false, file: null });
  };

  const handleRenameCancel = () => {
    setRenameDialog({ isOpen: false, file: null });
  };

  const handleDelete = async (fileId: string) => {
    if (!chosenProduct?.id || !selectedVehicleId) {
      showToast.error('Product and vehicle must be selected');
      return;
    }

    // Check if file has backend ID (numeric ID means it's from backend)
    const fileIdNum = parseInt(fileId);
    if (isNaN(fileIdNum)) {
      // Local file, just delete from store
      deleteFile(fileId);
      setFilesTree(explorer);
      return;
    }

    try {
      const response = await engineeringFilesService.deleteFile(fileIdNum, selectedVehicleId);

      if (response.success) {
        deleteFile(fileId);
        setFilesTree(explorer);
        showToast.success('File deleted successfully');
      } else {
        showToast.error(response.error || 'Failed to delete file');
      }
    } catch (error) {
      console.error('Error deleting file:', error);
      showToast.error('Failed to delete file');
    }
  };

  return (
    <div className="bg-white overflow-y-auto relative">
     
      <div className="relative h-9 w-full mb-2">
        <Input
          type="text"
          className="h-full w-full text-sm pr-10 p-2 px-3.5 flex justify-between flex-shrink-0 border border-[rgba(83,83,84,0.5)] text-[#181818] rounded-[8px]"
          onInput={(e) => onSearchInput(e)}
        />
        <div className="absolute top-[25%] right-4 text-gray-500 pointer-events-none">
          <SearchIcon width={18} />
        </div>
      </div>

      
      <ExplorerTree 
        files={filesTree} 
        onTabAdd={onTabAdd}
        onCreateFile={handleCreateFile}
        onCreateFolder={handleCreateFolder}
        onRename={handleRename}
        onDelete={handleDelete}
        currentFile={currentFile}
      />

     
      <RenameDialog
        isOpen={renameDialog.isOpen}
        onClose={handleRenameCancel}
        onConfirm={handleRenameConfirm}
        file={renameDialog.file}
      />
    </div>
  );
};

export default ExplorerPanel;
