'use client';

import Image from 'next/image';
import ConfirmBtn from '@/shared/ui/confirmBtn';
import { useCreationProductStore } from '../../store';
import { useState, useEffect, useRef, memo } from 'react';
import { useProductStore } from '@/entities/product/store';
import useAiStore from '@/store/AiStore';
import swotFileService from '@/lib/api/services/swotFileService';
import { useProductWorkspaceStore } from '@/store/productWorkspaceStore';
import { Descendant } from 'slate';

const convertTextToSlate = (text: string): Descendant[] => {
  if (!text || text.trim() === '') {
    return [{ type: 'paragraph', children: [{ text: '' }] }];
  }

  const lines = text.split('\n').filter(line => line.trim() !== '' || line === '');
  
  if (lines.length === 0) {
    return [{ type: 'paragraph', children: [{ text: '' }] }];
  }

  return lines.map(line => ({
    type: 'paragraph' as const,
    children: [{ text: line || '' }],
  }));
};

const GeneratePRD = memo(function GeneratePRD() {
  const productName = useCreationProductStore((state) => state.name);
  const materialFiles = useCreationProductStore((state) => state.materialFiles);
  const incrementStep = useCreationProductStore((state) => state.incrementStep);
  const decrimentStep = useCreationProductStore((state) => state.decrimentStep);
  const setSkippedPRDStep = useCreationProductStore((state) => state.setSkippedPRDStep);
  
  useEffect(() => {
    setSkippedPRDStep(false);
  }, [setSkippedPRDStep]);

  const { chosenProduct } = useProductStore();
  const { messages, sendMessage } = useAiStore();
  const { setCurrentDocument, setDocumentContent, setDocumentTitle } = useProductWorkspaceStore();

  const prdContentFromStore = useCreationProductStore((state) => state.prdContent);
  const setPrdContentToStore = useCreationProductStore((state) => state.setPrdContent);
  const [prdContent, setPrdContent] = useState(prdContentFromStore || '');
  const [prdGenerated, setPrdGenerated] = useState(false);
  const hasOpenedAiPartnerRef = useRef(false);
  const messageSentRef = useRef(false);
  const isCreatingPRDFileRef = useRef(false);
  const lastSavedContentRef = useRef('');

  useEffect(() => {
    if (!hasOpenedAiPartnerRef.current) {
      const aiStore = useAiStore.getState();
      if (!aiStore.isShowAiWindow) {
        aiStore.toggleAiWindow();
      }
      hasOpenedAiPartnerRef.current = true;
    }

    if (!messageSentRef.current && productName) {
      messageSentRef.current = true;
      
      setTimeout(() => {
        const prompt = `Generate a comprehensive Product Requirements Document (PRD) for "${productName}". ${materialFiles.length > 0 ? `I have uploaded ${materialFiles.length} supporting document(s) that should be used as reference material.` : 'Please create a detailed PRD based on the product name and any context available.'} The PRD should include all standard sections like overview, goals, user stories, features, technical requirements, success metrics, and timeline.`;
        
        if (materialFiles.length > 0) {
          sendMessage(prompt, materialFiles);
        } else {
          sendMessage(prompt);
        }
      }, 500);
    }
  }, []);



  const createPRDFile = async (content: string) => {
    if (isCreatingPRDFileRef.current) {
      console.log('[createPRDFile] Already processing, skipping...');
      return;
    }

    if (lastSavedContentRef.current === content) {
      console.log('[createPRDFile] Content unchanged, skipping save...');
      return;
    }

    if (!chosenProduct?.id) {
      console.log('[createPRDFile] Product not created yet, will save later');
      return;
    }

    isCreatingPRDFileRef.current = true;

    try {
      console.log(`[createPRDFile] Starting PRD file creation for product ${chosenProduct.id}`);
      
      const existingFiles = await swotFileService.getFiles(chosenProduct.id);
      let prdFile = existingFiles.files.find(f => f.title === 'PRD');

      const slateContent = convertTextToSlate(content);

      if (prdFile) {
        console.log(`[createPRDFile] Updating existing PRD file ${prdFile.id}`);
        await swotFileService.updateFile(prdFile.id, {
          content: slateContent
        });
      } else {
        console.log(`[createPRDFile] Creating new PRD file`);
        const newFile = await swotFileService.createFile({
          title: 'PRD',
          productId: chosenProduct.id
        });
        prdFile = newFile.file;
        
        console.log(`[createPRDFile] Updating newly created PRD file ${prdFile.id}`);
        await swotFileService.updateFile(prdFile.id, {
          content: slateContent
        });
      }

      const mockDocument = {
        id: prdFile.id,
        title: prdFile.title,
        content: JSON.stringify(slateContent),
        type: 'swot' as const,
        createdAt: prdFile.createdAt,
        updatedAt: prdFile.updatedAt,
        authorId: 0,
        productId: prdFile.productId,
        author: {
          id: 0,
          name: 'User',
          email: ''
        }
      };

      setCurrentDocument(mockDocument);
      setDocumentContent(slateContent);
      setDocumentTitle('PRD');

      lastSavedContentRef.current = content;

      window.dispatchEvent(new Event('product-changed'));
      console.log(`[createPRDFile] Successfully saved PRD file`);
    } catch (error: any) {
      if (error.code === 'ECONNABORTED') {
        console.warn('[createPRDFile] Timeout error - product may not be ready yet');
      } else if (error.response?.status === 404) {
        console.warn('[createPRDFile] 404 error - product or endpoint not found');
      } else {
        console.error('[createPRDFile] Error:', error.message || error);
      }
    } finally {
      setTimeout(() => {
        isCreatingPRDFileRef.current = false;
      }, 2000);
    }
  };

  useEffect(() => {
    if (chosenProduct?.id && prdGenerated && prdContent) {
      createPRDFile(prdContent);
    }
  }, [chosenProduct?.id]);

  useEffect(() => {
    const latestAiMessage = messages
      .filter(msg => msg.sender === 'AI' && !msg.isLoading && !msg.isTyping)
      .slice(-1)[0];

    if (latestAiMessage) {
      const content = latestAiMessage.fullMessage || latestAiMessage.message;
      if (content && content.trim() && content !== prdContent) {
        console.log('[GeneratePRD] New AI message received, updating PRD content');
        setPrdContent(content);
        setPrdContentToStore(content);
        setPrdGenerated(true);
        
        const timeoutId = setTimeout(() => {
          if (chosenProduct?.id) {
            createPRDFile(content);
          }
        }, 1000);

        return () => clearTimeout(timeoutId);
      }
    }
  }, [messages, chosenProduct?.id]);

  const handleContinue = () => {
    incrementStep();
  };

  return (
    <>
      <div className="bg-white h-[85vh] w-[85vw] rounded-4xl flex flex-col">
        <div className="w-[86%] mx-auto">
          <div className="flex justify-center pt-10">
            <Image
              src={'/creation-product-steps/third-step.svg'}
              alt="third-step"
              width={350}
              height={100}
            />
          </div>
          <h1 className="font-poppins font-semibold text-[24px] mt-5 text-center">
            PRD Workspace
          </h1>
        </div>

        <div className="w-[86%] flex-grow mx-auto mt-10">
          <label className="text-[#535354] text-[14px] mb-2 block">PRD Workspace</label>
          <textarea
            className="w-full p-4 border border-[#E0E0E0] rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-[#627899] focus:border-transparent"
            style={{ height: '500px' }}
            value={prdContent}
            onChange={(e) => setPrdContent(e.target.value)}
            placeholder="PRD will appear here once generated through AI Partner..."
          />
        </div>

        <div className="flex justify-between items-center pb-[30px] pt-5 w-[86%] mx-auto text-[14px]">
          <div
            className="hover:scale-90 hover:cursor-pointer active:scale-80 transition-all duration-300"
            onClick={decrimentStep}
          >
            <Image
              src={'icons/arrow-to-left.svg'}
              alt="arrow-to-left"
              height={24}
              width={24}
            />
          </div>
          <div className="flex items-center justify-end">
            <div className="w-[180px]">
              <ConfirmBtn
                className="h-[45px]"
                text="Continue"
                onClick={handleContinue}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
});

export default GeneratePRD;

