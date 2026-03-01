import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from '@/components/ui/accordion';
import { WorkspaceFile } from '@/entities/workspace';
import React from 'react';
import ContextMenu from './ContextMenu';
import InlineCreateInput from './InlineCreateInput';

interface ExplorerTreeProps {
  files: WorkspaceFile[];
  depth?: number;
  onTabAdd: (file: WorkspaceFile) => void;
  onCreateFile?: (name: string, parentId?: string) => void;
  onCreateFolder?: (name: string, parentId?: string) => void;
  onRename?: (fileId: string) => void;
  onDelete?: (fileId: string) => void;
  currentFile?: WorkspaceFile | null;
  creatingItem?: {
    type: 'file' | 'folder';
    parentId?: string;
  } | null;
  onConfirmCreate?: (name: string) => void;
  onCancelCreate?: () => void;
}

function ExplorerTree({ 
  files, 
  depth = 1, 
  onTabAdd, 
  onCreateFile, 
  onCreateFolder, 
  onRename, 
  onDelete,
  currentFile,
  creatingItem: propCreatingItem,
  onConfirmCreate: propOnConfirmCreate,
  onCancelCreate: propOnCancelCreate
}: ExplorerTreeProps) {
  const [contextMenu, setContextMenu] = React.useState<{
    x: number;
    y: number;
    fileId?: string;
  } | null>(null);
  const [localCreatingItem, setLocalCreatingItem] = React.useState<{
    type: 'file' | 'folder';
    parentId?: string;
  } | null>(null);
  const [expandedFolders, setExpandedFolders] = React.useState<string[]>([]);
  
  // Use prop creatingItem if provided, otherwise use local state
  const creatingItem = propCreatingItem !== undefined ? propCreatingItem : localCreatingItem;

  // Auto-expand parent folder when creating item inside it
  React.useEffect(() => {
    if (creatingItem?.parentId) {
      setExpandedFolders(prev => {
        if (!prev.includes(creatingItem.parentId!)) {
          return [...prev, creatingItem.parentId!];
        }
        return prev;
      });
    }
  }, [creatingItem?.parentId]);

  const handleContextMenu = (e: React.MouseEvent, fileId?: string) => {
    e.preventDefault();
    e.stopPropagation();
    
 
    const rect = e.currentTarget.getBoundingClientRect();
    setContextMenu({
      x: rect.left - 10,
      y: rect.top - 55,
      fileId,
    });
  };

  const handleCreateItem = (type: 'file' | 'folder', parentId?: string) => {
    if (propCreatingItem === undefined) {
      // Only set local state if not controlled by parent
      setLocalCreatingItem({ type, parentId });
    } else if (propOnConfirmCreate) {
      // If controlled by parent, trigger parent's handler
      // But we still need to set creatingItem state for this component
      // Actually, parent should handle this, so we just close context menu
    }
    setContextMenu(null);
  };

  const handleConfirmCreate = (name: string) => {
    if (creatingItem) {
      if (creatingItem.type === 'file') {
        onCreateFile?.(name, creatingItem.parentId);
      } else {
        onCreateFolder?.(name, creatingItem.parentId);
      }
    }
    if (propCreatingItem === undefined) {
      setLocalCreatingItem(null);
    } else if (propOnConfirmCreate) {
      propOnConfirmCreate(name);
    }
  };

  const handleCancelCreate = () => {
    if (propCreatingItem === undefined) {
      setLocalCreatingItem(null);
    } else if (propOnCancelCreate) {
      propOnCancelCreate();
    }
  };

  const handleContextMenuAction = (action: string) => {
    if (contextMenu?.fileId) {
      if (action === 'rename') {
        onRename?.(contextMenu.fileId);
      } else if (action === 'delete') {
        onDelete?.(contextMenu.fileId);
      }
    }
    setContextMenu(null);
  };

  return (
    <>
      <Accordion 
        type="multiple" 
        className="w-full"
        value={expandedFolders}
        onValueChange={setExpandedFolders}
      >
        {files.map((file, index) => {
          const isFolder = file.type === 'folder';
          const hasChildren = file.children && file.children.length > 0;
          const paddingLeft = `${(depth - 1) * 12}px`;
          // Create unique key by combining file ID with index and depth to ensure uniqueness across tree
          const uniqueKey = `${file.id}-${depth}-${index}`;

          return isFolder && hasChildren ? (
            <AccordionItem 
              className="border-none" 
              key={uniqueKey} 
              value={file.id}
            >
              <AccordionTrigger
                style={{ paddingLeft }}
                className="flex flex-row-reverse justify-start items-center !flex-none py-1 gap-1 hover:no-underline [&>svg]:rotate-270 [&[data-state=open]>svg]:rotate-360"
                onContextMenu={(e) => handleContextMenu(e, file.id)}
              >
                <span className="text-sm">{file.name}</span>
              </AccordionTrigger>
              <AccordionContent className="pb-1">
                {/* Show input inside this folder if parentId matches - before children */}
                {creatingItem && creatingItem.parentId === file.id && (
                  <div style={{ paddingLeft: `${depth * 12}px` }}>
                    <InlineCreateInput
                      type={creatingItem.type}
                      onConfirm={handleConfirmCreate}
                      onCancel={handleCancelCreate}
                      parentId={creatingItem.parentId}
                    />
                  </div>
                )}
                <ExplorerTree
                  files={file.children!}
                  depth={depth + 1}
                  onTabAdd={onTabAdd}
                  onCreateFile={onCreateFile}
                  onCreateFolder={onCreateFolder}
                  onRename={onRename}
                  onDelete={onDelete}
                  currentFile={currentFile}
                  creatingItem={creatingItem && creatingItem.parentId === file.id ? creatingItem : undefined}
                  onConfirmCreate={handleConfirmCreate}
                  onCancelCreate={handleCancelCreate}
                />
              </AccordionContent>
            </AccordionItem>
          ) : isFolder ? (
            <AccordionItem 
              className="border-none" 
              key={uniqueKey} 
              value={file.id}
            >
              <AccordionTrigger
                style={{ paddingLeft }}
                className="flex flex-row-reverse justify-start items-center !flex-none py-1 gap-1 hover:no-underline [&>svg]:rotate-270 [&[data-state=open]>svg]:rotate-360"
                onContextMenu={(e) => handleContextMenu(e, file.id)}
              >
                <span className="text-sm">{file.name}</span>
              </AccordionTrigger>
              <AccordionContent className="pb-1">
                {/* Show input inside empty folder if parentId matches */}
                {creatingItem && creatingItem.parentId === file.id && (
                  <div style={{ paddingLeft: `${depth * 12}px` }}>
                    <InlineCreateInput
                      type={creatingItem.type}
                      onConfirm={handleConfirmCreate}
                      onCancel={handleCancelCreate}
                      parentId={creatingItem.parentId}
                    />
                  </div>
                )}
              </AccordionContent>
            </AccordionItem>
          ) : (
            <button
              key={uniqueKey}
              style={{ paddingLeft }}
              className={`flex items-center gap-2 py-1 text-sm cursor-pointer w-full text-left transition-colors duration-150 ${
                currentFile?.id === file.id 
                  ? 'bg-gray-100 text-gray-800' 
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
              onClick={() => onTabAdd(file)}
              onContextMenu={(e) => handleContextMenu(e, file.id)}
            >
              {file.name.split('.')[1] ? (
                <span className="text-xs bg-gray-200 px-1 rounded">{file.name.split('.')[1].toUpperCase()}</span>
              ) : null}
              <span>{file.name}</span>
            </button>
          );
        })}
        
        {/* Show input at root level only if no parentId (creating at root) */}
        {creatingItem && !creatingItem.parentId && (
          <div style={{ paddingLeft: `${(depth - 1) * 12}px` }}>
            <InlineCreateInput
              type={creatingItem.type}
              onConfirm={handleConfirmCreate}
              onCancel={handleCancelCreate}
              parentId={creatingItem.parentId}
            />
          </div>
        )}
      </Accordion>

      {contextMenu && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          onClose={() => setContextMenu(null)}
          onNewFile={() => handleCreateItem('file', contextMenu.fileId)}
          onNewFolder={() => handleCreateItem('folder', contextMenu.fileId)}
          onRename={() => handleContextMenuAction('rename')}
          onDelete={() => handleContextMenuAction('delete')}
          selectedItem={contextMenu.fileId ? files.find(f => f.id === contextMenu.fileId) : null}
        />
      )}
    </>
  );
}

export default ExplorerTree;
