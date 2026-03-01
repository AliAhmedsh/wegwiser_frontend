import { useProductStore } from '@/entities/product/store';
import { useProductWorkspaceStore } from '@/store/productWorkspaceStore';
import useWorkspaceStore from '@/store/workSpaceStore';
import { useEffect, useRef, useState } from 'react';
import HeaderWS from './components/HeaderWS';
import WorkspaceEditor from './core/WorkspaceEditor';
import Comments from './sections/comments/Comments';
import FileNavBar from './sections/file-navbar/FileNavBar';
import Spinner from '@/shared/ui/Spinner';

interface ProductWorkspaceProps {
  onClose?: () => void;
}

const ProductWorkspace: React.FC<ProductWorkspaceProps> = ({ onClose }) => {
  const { isFullScreen, setFullScreen, fullScreenStyles, notFullScreenStyles } =
    useWorkspaceStore();
  const {
    currentDocument,
    loadDocument,
    createNewDocument,
    resetDocumentState,
    isLoading,
    documentTitle
  } = useProductWorkspaceStore();
  const { chosenProduct } = useProductStore();
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [isLoadingDocuments, setIsLoadingDocuments] = useState(false);

  // Check if a product is selected
  if (!chosenProduct) {
    return (
      <div 
        className="fixed inset-0 z-5 flex items-center justify-center bg-black/30"
        onClick={(e) => {
          if (e.target === e.currentTarget) {
            onClose?.();
          }
        }}
      >
        <div 
          className="relative h-auto w-[400px] bg-white rounded-2xl shadow-2xl p-8 flex flex-col items-center gap-4"
          onClick={(e) => e.stopPropagation()}
        >
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" fill="#FFA500" />
          </svg>
          <h3 className="text-xl font-semibold text-gray-900">No Product Selected</h3>
          <p className="text-center text-gray-600">
            Please select a product before opening the Product Workspace.
          </p>
          <button
            onClick={onClose}
            className="mt-4 px-6 py-2 bg-[#627899] text-white rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  // Reset document state when component mounts and unmounts
  useEffect(() => {
    // Reset on mount - no file should be selected by default
    resetDocumentState();
    setIsLoadingDocuments(false);

    // Cleanup on unmount
    return () => {
      resetDocumentState();
    };
  }, [resetDocumentState]);

  const onEnterFullScreen = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      setFullScreen(true);
      timeoutRef.current = null;
    }, 250);
  };

  return (
    <div
      className={`relative h-[90vh] w-[90vw] rounded-xl bg-[#FFF] shadow-2xl overflow-hidden flex flex-col ${isFullScreen ? fullScreenStyles : notFullScreenStyles
        } flex flex-col`}
      onMouseEnter={onEnterFullScreen}
    >
      <HeaderWS onClose={onClose} />

      <div
        className={`flex flex-1 gap-4 p-4 overflow-hidden bg-[#D5DBE3] ${isFullScreen ? ' ' : 'rounded-[12px]'
          }`}
      >
        <FileNavBar />
        <main className="w-4/8 bg-white p-4 rounded-md overflow-auto">
          {isLoadingDocuments ? (
            <div className="flex items-center justify-center w-full h-full" style={{ minHeight: '60vh' }}>
              <div className="flex items-center gap-2 text-[#9D9D9D]">
                <Spinner size="md" />
                <span className="text-sm">Loading documents...</span>
              </div>
            </div>
          ) : (
            <WorkspaceEditor />
          )}
        </main>
        <Comments />
      </div>
    </div>
  );
};

export default ProductWorkspace;
