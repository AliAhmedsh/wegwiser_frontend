import { useState } from 'react';
import Image from 'next/image';
import DOMPurify from 'dompurify';

import SectionBtn from '../../../shared/ui/sectionBtn';
import ModalWindow from '@/shared/portals/ModalWindow';

import ProductWorkspace from '@/workspaces/productWorkspace/ProductWorkspace';
import { Poppins } from 'next/font/google';

interface FilePreviewContentProps {
  closeModal: () => void;
  preview: string;
  fullName: string;
  lastUpdated: string;
}

const Poppins600 = Poppins({
  weight: ['600'],
  subsets: ['latin'],
});

const FilePreviewContent: React.FC<FilePreviewContentProps> = ({
  closeModal,
  preview,
  fullName,
  lastUpdated,
}) => {
  const sanitizedPreview = DOMPurify.sanitize(preview);

  const [isOpenWorkspace, setIsOpenWorkspace] = useState<boolean>(false);

  const handleWorkspaceClose = () => {
    setIsOpenWorkspace(false);
  };

  return (
    <div className="relative w-[90vw] h-[85vh] bottom-3 bg-[#EAEDF2] rounded-lg p-10">
      <div className="flex flex-row justify-between items-center">
        <div className="flex flex-col gap-2">
          <h4
            className={`font-poppins font-[600] text-[16px] text-[#000] ${Poppins600.className}`}
          >
            {fullName}
          </h4>
          <div className="flex flex-row gap-2">
            <Image
              width={8}
              height={8}
              src="icons/BlueCircle.svg"
              alt="circle"
            />
            <span className="font-opensans font-[400] text-[14px] text-[#000]">
              Last Edit {lastUpdated}
            </span>
          </div>
        </div>
        <div className="flex flex-row items-center gap-6.5">
          <SectionBtn width={16} height={16} src="icons/Download.svg" />
          <SectionBtn text="Share" alt="Share" theme="primary" />
          <SectionBtn
            src="icons/OpenInNew.svg"
            text="Open in workspace"
            alt="Open in workspace"
            theme="primary"
            onClick={() => setIsOpenWorkspace(true)}
          />
          <SectionBtn
            width={14}
            height={14}
            src="icons/ModalClose.svg"
            onClick={closeModal}
          />
        </div>
      </div>

      <div className="relative h-[calc(100%-80px)] mt-6 py-4 pl-6 pr-2 bg-[#fff] 
                text-[#181818] text-[14px] rounded-lg overflow-y-auto">
  <div className="mr-4 overflow-y-auto">
    <div dangerouslySetInnerHTML={{ __html: sanitizedPreview }} />
  </div>
</div>



      <ModalWindow isOpen={isOpenWorkspace} onClose={handleWorkspaceClose}>
        <ProductWorkspace />
      </ModalWindow>
    </div>
  );
};

export default FilePreviewContent;
