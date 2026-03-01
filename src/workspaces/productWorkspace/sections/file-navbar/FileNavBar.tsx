import Image from 'next/image';
import { useState, useEffect, useCallback, useRef } from 'react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { useProductStore } from '@/entities/product/store';
import { useProductWorkspaceStore } from '@/store/productWorkspaceStore';
import swotFileService, { SwotFile } from '@/lib/api/services/swotFileService';

import DescriptionAccordion from './ui/DescriptionAccordion';
import FeaturesAccordion from './ui/FeaturesAccordion';
import MarketResAccordion from './ui/MarketResAccordion';
import ResPlanningAccordion from './ui/ResPlanningAccordion';
import HeadersAccordion from './ui/HeadersAccordion';

const FileNavBar: React.FC = () => {
  const { chosenProduct } = useProductStore();
  const { 
    currentDocument, 
    setCurrentDocument, 
    setDocumentContent, 
    setDocumentTitle,
    resetDocumentState 
  } = useProductWorkspaceStore();
  const [swotItems, setSwotItems] = useState<SwotFile[]>([]);
  const [editingItem, setEditingItem] = useState<number | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFileId, setSelectedFileId] = useState<number | null>(null);
  const loadingRef = useRef(false);
  const lastProductIdRef = useRef<number | null>(null);

  const handleFileSelect = useCallback(async (file: SwotFile) => {
    if (selectedFileId === file.id) return;
    
    setSelectedFileId(file.id);
    
    try {
      let content;
      try {
        let parsedContent = JSON.parse(file.content);
        
        if (typeof parsedContent === 'string') {
          parsedContent = JSON.parse(parsedContent);
        }
        
        content = Array.isArray(parsedContent) ? parsedContent : [{ type: 'paragraph', children: [{ text: '' }] }];
      } catch (error) {
        console.error('Error parsing file content:', error, file.content);
        content = [{ type: 'paragraph', children: [{ text: '' }] }];
      }

      const mockDocument = {
        id: file.id,
        title: file.title,
        content: JSON.stringify(content),
        type: 'swot' as const,
        createdAt: file.createdAt,
        updatedAt: file.updatedAt,
        authorId: 0,
        productId: file.productId,
        author: {
          id: 0,
          name: 'User',
          email: ''
        }
      };

      setCurrentDocument(mockDocument);
      setDocumentContent(content);
      setDocumentTitle(file.title);
    } catch (error) {
      console.error('Error loading file content:', error);
    }
  }, [selectedFileId, setCurrentDocument, setDocumentContent, setDocumentTitle]);

  useEffect(() => {
    const loadSwotFiles = async () => {
      if (!chosenProduct?.id) {
        setSwotItems([]);
        lastProductIdRef.current = null;
        return;
      }

      if (loadingRef.current) {
        return;
      }

      loadingRef.current = true;
      setIsLoading(true);

      try {
        const response = await swotFileService.getFiles(chosenProduct.id);
        console.log('Loaded files:', response.files.length, response.files.map(f => f.title));
        setSwotItems(response.files);
        
        if (response.files.length > 0) {
          const prdFile = response.files.find(f => f.title === 'PRD');
          if (prdFile) {
            console.log('Auto-selecting PRD file:', prdFile.id);
            await handleFileSelect(prdFile);
          } else if (selectedFileId === null) {
            const fileToLoad = response.files[0];
            console.log('Auto-selecting first file:', fileToLoad.title);
            await handleFileSelect(fileToLoad);
          }
        }
      } catch (error) {
        console.error('Error loading SWOT files:', error);
        setSwotItems([]);
      } finally {
        setIsLoading(false);
        loadingRef.current = false;
      }
    };

    if (lastProductIdRef.current !== chosenProduct?.id) {
      lastProductIdRef.current = chosenProduct?.id || null;
      loadSwotFiles();
    }
  }, [chosenProduct?.id]);

  useEffect(() => {
    const handleProductChanged = async () => {
      if (chosenProduct?.id && !loadingRef.current) {
        loadingRef.current = true;
        setIsLoading(true);
        
        try {
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          console.log('Reloading files for product:', chosenProduct.id);
          const response = await swotFileService.getFiles(chosenProduct.id);
          console.log('Files reloaded:', response.files.length, response.files.map(f => ({ id: f.id, title: f.title })));
          setSwotItems(response.files);
          
          if (response.files.length > 0) {
            const prdFile = response.files.find(f => f.title === 'PRD');
            if (prdFile) {
              console.log('Auto-selecting PRD file:', prdFile.id);
              setSelectedFileId(null);
              await new Promise(resolve => setTimeout(resolve, 100));
              await handleFileSelect(prdFile);
            } else if (selectedFileId === null && response.files.length > 0) {
              console.log('Auto-selecting first file:', response.files[0].title);
              await handleFileSelect(response.files[0]);
            }
          }
        } catch (error) {
          console.error('Error reloading SWOT files:', error);
        } finally {
          setIsLoading(false);
          loadingRef.current = false;
        }
      }
    };

    const handlePRDFileCreated = async (event: CustomEvent) => {
      if (event.detail?.productId === chosenProduct?.id && !loadingRef.current) {
        console.log('PRD file created event received, fileId:', event.detail.fileId);
        await handleProductChanged();
      }
    };

    window.addEventListener('product-changed', handleProductChanged);
    window.addEventListener('prd-file-created', handlePRDFileCreated as EventListener);
    return () => {
      window.removeEventListener('product-changed', handleProductChanged);
      window.removeEventListener('prd-file-created', handlePRDFileCreated as EventListener);
    };
  }, [chosenProduct?.id, selectedFileId, handleFileSelect]);

  const handleAddSwotItem = async () => {
    if (!chosenProduct?.id) {
      alert('Please select a product to create files.');
      return;
    }

    setIsLoading(true);
    try {
      const response = await swotFileService.createFile({
        title: `New File ${swotItems.length + 1}`,
        productId: chosenProduct.id
      });

      setSwotItems(prev => [...prev, response.file]);
    } catch (error) {
      console.error('Error creating SWOT file:', error);
      alert('Failed to create file. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };


  const handleStartEdit = (id: number, currentTitle: string) => {
    setEditingItem(id);
    setEditTitle(currentTitle);
  };

  const handleSaveEdit = async () => {
    if (editTitle.trim() && editingItem) {
      try {
        await swotFileService.updateFile(editingItem, {
          title: editTitle.trim()
        });

        setSwotItems(prev => prev.map(item => 
          item.id === editingItem 
            ? { ...item, title: editTitle.trim() }
            : item
        ));
      } catch (error) {
        console.error('Error updating SWOT file:', error);
        alert('Failed to update file name. Please try again.');
      }
    }
    setEditingItem(null);
    setEditTitle('');
  };

  const handleCancelEdit = () => {
    setEditingItem(null);
    setEditTitle('');
  };

  return (
    <aside className="w-2/8 bg-[#fff] px-4 py-6 rounded-md overflow-auto">
      <button
        onClick={handleAddSwotItem}
        disabled={isLoading || !chosenProduct?.id}
        className={`flex items-center gap-2 mt-4 ml-2 transition-colors ${
          isLoading || !chosenProduct?.id
            ? 'text-gray-400 cursor-not-allowed'
            : 'text-[#627899] hover:text-[#535354] cursor-pointer'
        }`}
        title={!chosenProduct?.id ? 'Please select a product first' : 'Add new file'}
      >
        <span className="text-lg font-bold">+</span>
        <span className="font-inter font-[600] text-[14px]">
          {isLoading ? 'Adding...' : 'Add File'}
        </span>
      </button>

      {swotItems.length === 0 ? (
        <div className="text-center py-8">
          <div className="text-gray-400 mb-4">
            <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <p className="text-gray-500 text-sm mb-4">No Files yet</p>
          <p className="text-gray-400 text-xs">Click "Add File" to create your first SWOT analysis</p>
        </div>
      ) : (
        <div className="space-y-2">
          {swotItems.map((item, index) => (
            <div 
              key={item.id} 
              className={`p-3 rounded-md cursor-pointer transition-colors ${
                selectedFileId === item.id 
                  ? 'bg-gray-50 border border-gray-100' 
                  : 'hover:bg-gray-25 border border-transparent'
              }`}
              onClick={() => handleFileSelect(item)}
            >
              <div className="flex flex-row items-center gap-2">
                <Image
                  src="/icons/SideNavPrWs.svg"
                  alt="side nav icon"
                  width={24}
                  height={24}
                />
                {editingItem === item.id ? (
                  <input
                    type="text"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    onBlur={handleSaveEdit}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleSaveEdit();
                      } else if (e.key === 'Escape') {
                        handleCancelEdit();
                      }
                    }}
                    className="font-inter font-[700] text-[#000] text-[14px] bg-transparent border-b border-gray-300 focus:outline-none focus:border-blue-500 w-auto"
                    style={{ width: `${editTitle.length * 8.5}px` }}
                    autoFocus
                    onClick={(e) => e.stopPropagation()} // Prevent file selection when editing
                  />
                ) : (
                  <h2 
                    className={`font-inter font-[700] text-[14px] ${
                      selectedFileId === item.id ? 'text-gray-700' : 'text-[#000]'
                    }`}
                    onDoubleClick={(e) => {
                      e.stopPropagation();
                      handleStartEdit(item.id, item.title);
                    }}
                    title="Double-click to rename"
                  >
                    {item.title}
                  </h2>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </aside>
  );
};

export default FileNavBar;
