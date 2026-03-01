import { useProductStore } from '@/entities/product/store';
import SectionBtn from '@/shared/ui/sectionBtn';
import Image from 'next/image';
import { useState } from 'react';
import ShareModal from './ShareModal';
import { useProductWorkspaceStore } from '@/store/productWorkspaceStore';
import { showToast } from '@/lib/utils/toast';

interface HeaderWSProps {
  onClose?: () => void;
}

const HeaderWS: React.FC<HeaderWSProps> = ({ onClose }) => {
  const [showShareModal, setShowShareModal] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const { chosenProduct } = useProductStore();
  const { currentDocument, documentContent } = useProductWorkspaceStore();

  const handleShareClick = () => {
    setShowShareModal(true);
  };

  const handleDownloadPDF = async () => {
    if (!currentDocument) {
      showToast.warning('Please select a file to download');
      return;
    }

    if (!chosenProduct) {
      showToast.warning('Product information not available');
      return;
    }

    setIsDownloading(true);
    const toastId = showToast.loading('Generating PDF...');

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/workspace/download-pdf`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${document.cookie.split('access_token=')[1]?.split(';')[0] || document.cookie.split('token=')[1]?.split(';')[0]}`,
          },
          body: JSON.stringify({
            fileId: currentDocument.id,
            fileTitle: currentDocument.title,
            fileContent: JSON.stringify(documentContent),
            fileType: currentDocument.type || 'document',
            productId: chosenProduct.id,
          }),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to generate PDF');
      }

      // Get PDF blob
      const blob = await response.blob();
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${currentDocument.title}.pdf`;
      document.body.appendChild(a);
      a.click();
      
      // Cleanup
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      showToast.updateSuccess(toastId, 'PDF downloaded successfully!');
    } catch (error) {
      console.error('Failed to download PDF:', error);
      showToast.updateError(toastId, 'Failed to download PDF. Please try again.');
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <>
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
            Product Workspace
          </span>
        </div>

        <div className="flex gap-2">
          <div onClick={handleDownloadPDF} className={isDownloading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}>
            <SectionBtn width={16} height={16} src="icons/Download.svg" />
          </div>
          <div onClick={handleShareClick}>
            <SectionBtn customClasses="w-18" text="Share" alt="Share" theme="primary" />
          </div>
        </div>
      </div>

      {showShareModal && chosenProduct && (
        <ShareModal
          onClose={() => setShowShareModal(false)}
          productId={chosenProduct.id}
          currentDocument={currentDocument}
        />
      )}
    </>
  );
};

export default HeaderWS;
