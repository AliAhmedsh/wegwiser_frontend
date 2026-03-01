import { useProductStore } from '@/entities/product/store';
import useWorkspaceStore from '@/store/workSpaceStore';
import { useRef, useState, useEffect } from 'react';
import Image from 'next/image';
import WorkspaceEditor from './core/WorkspaceEditor';
import Modal from '@/shared/portals/ModalWindow';
import useAiStore from '@/store/AiStore';
import swotFileService from '@/lib/api/services/swotFileService';
import { useProductWorkspaceStore } from '@/store/productWorkspaceStore';
import { Descendant } from 'slate';
import FileNavBar from './sections/file-navbar/FileNavBar';

interface PRDGeneratedScreenProps {
  onClose?: () => void;
  onNext?: () => void;
}

// Helper function to convert text to Slate format
const convertTextToSlate = (text: string): Descendant[] => {
  if (!text || text.trim() === '') {
    return [{ type: 'paragraph', children: [{ text: '' }] }];
  }

  // Split by newlines and create paragraphs
  const lines = text.split('\n').filter(line => line.trim() !== '' || line === '');
  
  if (lines.length === 0) {
    return [{ type: 'paragraph', children: [{ text: '' }] }];
  }

  return lines.map(line => ({
    type: 'paragraph' as const,
    children: [{ text: line || '' }],
  }));
};

const PRDGeneratedScreen: React.FC<PRDGeneratedScreenProps> = ({ onClose, onNext }) => {
  const { isFullScreen, setFullScreen, fullScreenStyles, notFullScreenStyles } =
    useWorkspaceStore();
  const { chosenProduct } = useProductStore();
  const { messages } = useAiStore();
  const { setCurrentDocument, setDocumentContent, setDocumentTitle } = useProductWorkspaceStore();
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [showPRDCard, setShowPRDCard] = useState(true); // Show by default
  const prdFileCreatedRef = useRef(false);
  const processedMessageIdRef = useRef<string | number | null>(null);
  
  // Show PRD Generated popup when component mounts (already true, but ensure it shows)
  useEffect(() => {
    // Ensure popup shows when screen loads
    setShowPRDCard(true);
  }, []);

  // Create PRD file from AI response when component mounts - only once
  useEffect(() => {
    const createPRDFile = async () => {
      if (!chosenProduct?.id || prdFileCreatedRef.current) return;

      // Get the latest AI response (last message from AI)
      const latestAiMessage = messages
        .filter(msg => msg.sender === 'AI')
        .slice(-1)[0];

      if (!latestAiMessage) {
        return;
      }

      // Check if we've already processed this message
      const messageId = latestAiMessage.id || latestAiMessage.timestamp || latestAiMessage.message?.substring(0, 50);
      if (processedMessageIdRef.current === messageId) {
        return;
      }

      // Use fullMessage if available (complete), otherwise use message (might be partial during typing)
      const prdContent = latestAiMessage.fullMessage || latestAiMessage.message;
      
      if (!prdContent || prdContent.trim() === '') {
        return;
      }

      // Mark as processing to prevent duplicate calls
      prdFileCreatedRef.current = true;
      processedMessageIdRef.current = messageId;

      try {
        // Check if PRD file already exists
        const existingFiles = await swotFileService.getFiles(chosenProduct.id);
        let prdFile = existingFiles.files.find(f => f.title === 'PRD');

        // Convert text to Slate format
        const slateContent = convertTextToSlate(prdContent);

        if (prdFile) {
          // Update existing PRD file - send content as object, backend will stringify
          const updatedFile = await swotFileService.updateFile(prdFile.id, {
            content: slateContent
          });
          prdFile = updatedFile.file;
        } else {
          // Create new PRD file
          const newFile = await swotFileService.createFile({
            title: 'PRD',
            productId: chosenProduct.id
          });
          prdFile = newFile.file;
          
          // Update with content - send content as object, backend will stringify
          await swotFileService.updateFile(prdFile.id, {
            content: slateContent
          });
        }

        // Load the PRD file in the editor
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

        console.log('✅ PRD file created and loaded:', prdFile.title);
        
        // Trigger FileNavBar refresh (only once)
        window.dispatchEvent(new Event('product-changed'));
      } catch (error) {
        console.error('Error creating PRD file:', error);
        // Reset on error so user can retry
        prdFileCreatedRef.current = false;
        processedMessageIdRef.current = null;
      }
    };

    // Only run if we have messages and haven't processed yet
    if (messages.length > 0 && !prdFileCreatedRef.current) {
      createPRDFile();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chosenProduct?.id]); // Only depend on productId, not messages array
  
  // During product creation, there might not be a chosenProduct yet
  // This is okay - we'll show the screen anyway

  const onEnterFullScreen = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      setFullScreen(true);
      timeoutRef.current = null;
    }, 250);
  };

  // Custom header with Next button instead of Done
  const CustomHeader = () => (
    <div className="flex items-center justify-between py-3 px-4">
      <div className="flex items-center gap-2 cursor-pointer" onClick={onClose}>
        <Image
          width={24}
          height={24}
          src="icons/ArrowBack.svg"
          alt="arrow icon"
          className="hover:scale-95 transition-all active:scale-90"
        />
        <span className="font-poppins font-[600] text-[#000] text-[14px]">
          Add Supporting Material
        </span>
      </div>

      <div className="flex gap-2">
        {onNext && (
          <button
            onClick={onNext}
            className="px-4 py-2 bg-[#627899] text-white rounded-lg font-poppins font-[600] text-[14px] hover:bg-[#536080] transition-colors"
          >
            Next
          </button>
        )}
      </div>
    </div>
  );

  return (
    <div
      className={`relative h-[90vh] w-[90vw] rounded-xl bg-[#FFF] shadow-2xl overflow-hidden flex flex-col ${isFullScreen ? fullScreenStyles : notFullScreenStyles
        } flex flex-col`}
      onMouseEnter={onEnterFullScreen}
    >
      <CustomHeader />

      <div
        className={`flex flex-1 gap-4 p-4 overflow-hidden bg-[#D5DBE3] ${isFullScreen ? ' ' : 'rounded-[12px]'
          }`}
      >
        {/* File Navigation Sidebar */}
        <FileNavBar />

        <main className="flex-1 bg-white p-4 rounded-md overflow-auto">
          <WorkspaceEditor />
        </main>
      </div>
      
      {/* PRD Generated Modal Popup - Centered on screen, outside flex container */}
      {showPRDCard && (
        <Modal 
          isOpen={showPRDCard} 
          onClose={() => setShowPRDCard(false)} 
          noDimming={true}
        >
          <div className="bg-white rounded-2xl shadow-xl border border-[#858585] p-6 flex flex-col items-center justify-center text-center max-w-sm mx-auto">
            {/* Stars Icon - Same as PRD Missing Modal */}
            <div className="mb-6">
              <Image
                src="/icons/Stars.svg"
                alt="stars"
                width={28}
                height={28}
              />
            </div>

            <h2 className="text-sm font-bold mb-4 text-black">PRD generated!</h2>
            <p className="text-xs font-normal text-[#000000] mb-8">
              Based on the information and files provided, Wegwiser has generated a PRD.
            </p>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default PRDGeneratedScreen;

