import { useDesignWorkspace } from '@/entities/designWorkspace/hooks/useDesignWorkspace';
import { useDesignWorkspaceStore } from '@/entities/designWorkspace/store/designWorkspaceStore';
import { useProductStore } from '@/entities/product/store';
import ArrowDownIcon from '@/shared/icons/ArrowDownIcon';
import LeftSideBarIcon from '@/shared/icons/LeftSideBarIcon';
import PlusIcon from '@/shared/icons/PlusIcon';
import SearchIcon from '@/shared/icons/SearchIcon';
import React, { useEffect, useRef } from 'react';


interface Layer {
  id: string;
  name: string;
  type: 'element' | 'group';
  children?: Layer[];
  selected?: boolean;
  expanded?: boolean;
  backendId?: number;
  parentId?: number;
}

interface LeftSidebarProps {
  // No props needed - we'll use the first page from the fetched pages
}

export default function LeftSidebar() {
  // Get the selected product from the store
  const { chosenProduct } = useProductStore();
  const productId = chosenProduct?.id;
  // Use the design workspace store and hooks
  const {
    pages,
    layers,
    currentPage,
    editingPage,
    editingPageName,
    editingLayer,
    editingLayerName,
    setCurrentWorkspace,
    setCurrentPage,
    setCurrentPageData,
    setSelectedLayerId,
    startEditingPage,
    savePageEdit,
    cancelPageEdit,
    setEditingPageName,
    startEditingLayer,
    saveLayerEdit,
    cancelLayerEdit,
    setEditingLayerName,
    selectLayer,
    toggleLayerExpansion,
    addChildLayer
  } = useDesignWorkspaceStore();

  // Get the current page ID from the store
  const currentPageId = useDesignWorkspaceStore(state => state.currentPageId);

  const {
    createPage,
    updatePage,
    createLayer,
    updateLayer,
    deleteLayer,
    reorderLayers,
    isCreatingPage,
    isUpdatingPage,
    isCreatingLayer,
    isUpdatingLayer,
    isDeletingLayer,
    refreshPages,
    refreshPage
  } = useDesignWorkspace(productId, currentPageId || undefined, !!currentPageId); // Enable page query when pageId exists

  // Initialize workspace and page on mount
  useEffect(() => {
    if (productId) {
      setCurrentWorkspace(productId);
    }
    if (currentPageId) {
      setCurrentPage(currentPageId);
    }
  }, [productId, currentPageId, setCurrentWorkspace, setCurrentPage]);

  // Auto-select first page only on initial load (when pages are first loaded and no page is selected)
  // Use a ref to track if we've already done initial auto-selection
  const hasAutoSelectedRef = useRef(false);
  
  useEffect(() => {
    // Only auto-select if:
    // 1. Pages exist
    // 2. No page is currently selected
    // 3. We haven't already done an initial auto-selection
    if (pages.length > 0 && !currentPageId && !hasAutoSelectedRef.current) {
      hasAutoSelectedRef.current = true;
      handlePageSelect(pages[0]);
    }
    
    // Reset the flag if pages become empty (e.g., vehicle change)
    if (pages.length === 0) {
      hasAutoSelectedRef.current = false;
    }
  }, [pages, currentPageId]);

  const addNewPage = () => {
    if (!productId) {
      return;
    }
    console.log('🔵 addNewPage clicked - Creating new page with POST API');
    const newPageName = `Pages ${pages.length + 1}`;
    createPage({ productId, data: { name: newPageName } });
  };

  const handlePageSelect = async (page: any) => {
    
    // Set current page first
    setCurrentPage(page.id);
    
    // Clear selected layer to show all page designs
    setSelectedLayerId(null);
    
    // Set page data directly from the page object we already have
    // This avoids unnecessary API calls and prevents selection reset
    setCurrentPageData(page);
    
    // Optionally refetch pages query with the new pageId to update the URL
    // But don't wait for it to avoid blocking the UI
    if (productId) {
      // Invalidate pages query so it refetches with the new pageId in params
      refreshPages();
    }
    
  };

  const handleKeyPress = (e: React.KeyboardEvent, index: number) => {
    if (e.key === 'Enter') {
      savePageEdit(index, editingPageName);
    } else if (e.key === 'Escape') {
      cancelPageEdit();
    }
  };

  const addNewLayer = () => {
    if (!currentPageId) {
      console.warn('Cannot create layer: No page selected');
      if (pages.length > 0) {
        handlePageSelect(pages[0]);
        setTimeout(() => {
          const newLayerName = `Element ${layers.length + 1}`;
          createLayer({ pageId: pages[0].id, data: { name: newLayerName } });
        }, 100);
      } else {
        console.warn('Cannot create layer: No pages available');
      }
      return;
    }
    
    const newLayerName = `Element ${layers.length + 1}`;
    createLayer({ 
      pageId: currentPageId, 
      data: { name: newLayerName } 
    });
  };

  // Recursive function to find a layer by ID in nested structure
  const findLayerById = (layerList: Layer[], targetId: string): Layer | null => {
    for (const layer of layerList) {
      if (layer.id === targetId) {
        return layer;
      }
      if (layer.children && layer.children.length > 0) {
        const found = findLayerById(layer.children, targetId);
        if (found) return found;
      }
    }
    return null;
  };

  const addChildLayerToParent = (parentId: string) => {
    if (!currentPageId) {
      console.warn('Cannot create child layer: No page selected');
      return;
    }
    
    // Find the parent layer in nested structure (including children)
    const parentLayer = findLayerById(layers, parentId);
    
    if (!parentLayer) {
      console.warn(`Parent layer not found: ${parentId}`);
      return;
    }
    
    if (!parentLayer.backendId) {
      console.warn(`Parent layer has no backendId: ${parentId}`);
      return;
    }
    
    const childCount = parentLayer.children?.length || 0;
    const newChildName = `Element ${childCount + 1}`;
    
    createLayer({
      pageId: currentPageId,
      data: {
        name: newChildName,
        parentId: parentLayer.backendId
      }
    });
  };

  const handleLayerKeyPress = (e: React.KeyboardEvent, layerId: string) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      // Only save if name actually changed
      const layer = layers.find(l => l.id === layerId);
      if (layer && layer.name !== editingLayerName.trim() && editingLayerName.trim() && layer.backendId) {
        // Update local state first
        saveLayerEdit(layerId, editingLayerName.trim());
        // Then call API to save to backend
        updateLayer({
          layerId: layer.backendId,
          data: { name: editingLayerName.trim() }
        });
      } else {
        cancelLayerEdit();
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      cancelLayerEdit();
    }
  };

  const handleLayerNameChange = (layerId: string, newName: string) => {
    // Only save if name actually changed
    const layer = layers.find(l => l.id === layerId);
    if (layer && layer.name !== newName.trim() && newName.trim() && layer.backendId) {
      // Update local state first
      saveLayerEdit(layerId, newName.trim());
      // Then call API to save to backend
      updateLayer({
        layerId: layer.backendId,
        data: { name: newName.trim() }
      });
    } else {
      // Just cancel if name didn't change or is empty
      cancelLayerEdit();
    }
  };

  const renderLayer = (layer: Layer, depth: number = 0, parentPath: string = '') => {
    const isEditing = editingLayer === layer.id;
    const paddingLeft = depth * 16;
    const hasChildren = layer.children && layer.children.length > 0;
    // Create unique key by combining layer ID with parent path to avoid duplicates
    const uniqueKey = `${parentPath}-${layer.id}`;

    return (
      <div key={uniqueKey} className="relative">
        <div
          className={`px-4 py-1 text-sm font-normal text-[#181818] flex items-center justify-between cursor-pointer hover:bg-gray-50 ${layer.selected ? 'bg-blue-50 border-l-2 border-blue-500' : ''
            }`}
          style={{ paddingLeft: `${paddingLeft + 16}px` }}
          onClick={() => {
            selectLayer(layer.id);
            if (layer.backendId) {
              setSelectedLayerId(layer.backendId);
            } else {
              console.warn('Layer has no backend ID!');
            }
          }}
        >
          {isEditing ? (
            <input
              type="text"
              value={editingLayerName}
              onChange={(e) => setEditingLayerName(e.target.value)}
              onBlur={() => handleLayerNameChange(layer.id, editingLayerName)}
              onKeyDown={(e) => handleLayerKeyPress(e, layer.id)}
              className="w-full bg-transparent border-none outline-none text-sm font-normal text-[#181818]"
              autoFocus
              onClick={(e) => e.stopPropagation()}
              disabled={isUpdatingLayer}
            />
          ) : (
            <div className="flex items-center w-full">
              {/* Expand/Collapse icon - show before layer name if has children */}
              {hasChildren && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleLayerExpansion(layer.id);
                  }}
                  className="flex items-center justify-center mr-2 hover:bg-gray-200 rounded p-0.5 transition-colors"
                  style={{ transform: layer.expanded ? 'rotate(0deg)' : 'rotate(-90deg)' }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <g clipPath="url(#clip0_495_6773)">
                      <path d="M1.9348 6.165L1.0498 7.05L5.9998 12L10.9498 7.05L10.0648 6.165L5.9998 10.23L1.9348 6.165Z" fill="#627899" />
                    </g>
                    <defs>
                      <clipPath id="clip0_495_6773">
                        <rect width="12" height="12" fill="white" transform="translate(0 12) rotate(-90)" />
                      </clipPath>
                    </defs>
                  </svg>
                </button>
              )}
              {!hasChildren && <div className="w-3 mr-2" />} {/* Spacer when no children */}
              <span
                className='mr-4 flex-1'
                onDoubleClick={(e) => {
                  e.stopPropagation();
                  startEditingLayer(layer.id, layer.name);
                }}
              >
                {layer.name}
              </span>
              <div className="flex items-center gap-1">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    addChildLayerToParent(layer.id);
                  }}
                  className="flex items-center justify-center hover:bg-gray-200 rounded p-1 transition-colors"
                  disabled={isCreatingLayer}
                >
                  <PlusIcon width={12} height={12} className="text-[#627899]" />
                </button>
              </div>
            </div>
          )}
        </div>
        {hasChildren && layer.expanded && layer.children?.map((child, index) => renderLayer(child, depth + 1, uniqueKey))}
      </div>
    );
  };


  return (
    <div className="h-full bg-[#D5DBE3] flex flex-col p-2 w-[340px] flex-shrink-0 rounded-xl">
      <div className="bg-white h-full rounded-xl">
        <div className="pb-4 pt-2 px-4 border-b border-[#E8E8E8]">
          <div className="font-semibold text-sm flex items-center gap-2">
            <button className="inline-block w-5 h-5 rounded mr-2">
              <LeftSideBarIcon size={20} />
            </button>
            <p>Search UI – Draft</p>
            <span className="text-xs text-gray-400">
              <ArrowDownIcon />
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2 px-4 pt-2 pb-2 text-black border-b border-[#E8E8E8] font-semibold text-sm">
          <div className="flex flex-col items-center pr-2">
            <button>Pages</button>
            <svg xmlns="http://www.w3.org/2000/svg" width="47" height="5" viewBox="0 0 51 5" fill="none">
              <path d="M2.1543 2.55127L49.004 2.55127" stroke="black" strokeWidth="3.34641" strokeLinecap="round" />
            </svg>
          </div>

          <button className="pr-2">Assets</button>
          <button className="ml-auto">
            <SearchIcon />
          </button>
        </div>
        <div className="px-4 py-2 text-sm font-normal text-[#181818] border-b border-[#E8E8E8] flex items-center justify-between">
          <span>Pages</span>
          <button
            onClick={addNewPage}
            className="hover:bg-gray-100 rounded p-1 transition-colors"
            disabled={isCreatingPage}
          >
            <PlusIcon width={20} height={20} className="text-[#181818]" />
          </button>
        </div>
        {pages.map((page, index) => (
          <div
            key={page.id}
            className={`px-4 py-2 text-sm font-normal text-[#181818] border-b border-[#E8E8E8] cursor-pointer hover:bg-gray-50 ${currentPageId === page.id ? 'bg-blue-50 border-l-2 border-blue-500' : ''
              }`}
            onClick={() => handlePageSelect(page)}
          >
            {editingPage === index ? (
              <input
                type="text"
                value={editingPageName}
                onChange={(e) => setEditingPageName(e.target.value)}
                onBlur={() => {
                  if (editingPageName.trim()) {
                    updatePage({ pageId: page.id, data: { name: editingPageName.trim() } });
                  }
                  cancelPageEdit();
                }}
                onKeyDown={(e) => handleKeyPress(e, index)}
                className="w-full bg-transparent border-none outline-none text-sm font-normal text-[#181818]"
                autoFocus
                disabled={isUpdatingPage}
                onClick={(e) => e.stopPropagation()}
              />
            ) : (
              <span
                onDoubleClick={(e) => {
                  e.stopPropagation();
                  startEditingPage(index, page.name);
                }}
                className="block"
              >
                {page.name}
              </span>
            )}
          </div>
        ))}
        <div className="px-4 py-2 text-sm font-semibold text-[#181818] flex items-center justify-between">
          <span>Layers</span>
          <button
            onClick={addNewLayer}
            className="hover:bg-gray-100 rounded p-1 transition-colors"
            disabled={isCreatingLayer}
          >
            <PlusIcon width={16} height={16} className="text-[#181818]" />
          </button>
        </div>
        <div className="px-0 pb-2 text-sm font-normal h-[65%] overflow-y-scroll">
          {layers.map((layer, index) => renderLayer(layer, 0, `root-${index}`))}
        </div>
      </div>
    </div>
  );
} 