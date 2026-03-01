import { ReactNode, useState } from 'react';
import Image from 'next/image';

import { useSliderStore } from '../../../store/sliderStore';

import ModalWindow from '../../../shared/portals/ModalWindow';
import FilePreviewContent from './FilePreviewContent';

import { File } from '../types/files';

interface FileListProps {
  files: File[];
  filesAmount: number;
  children?: ReactNode;
}

const FileList: React.FC<FileListProps> = ({
  files,
  filesAmount,
  children,
}) => {
  const [isOpenModal, setIsOpenModal] = useState(false);
  const [currentFile, setCurrentFile] = useState<File | null>(null);

  const { hideAllTabs } = useSliderStore();

  const handleOpenModal = (file: File) => {
    hideAllTabs();
    setCurrentFile(file);
    setIsOpenModal(true);
  };

  const handleCloseModal = () => {
    setIsOpenModal(false);
  };

  return (
    <div className="flex flex-row gap-4 mt-4">
      <h4 className="min-w-[135px] font-poppins font-semibold text-[16px] text-[#181818]">
        Files({filesAmount})
      </h4>

      <div className="flex flex-col items-start gap-2">
        {files.map((file, index) => (
          <button
            onClick={() => handleOpenModal(file)}
            key={index}
            className="flex flex-row items-center gap-2 cursor-pointer"
          >
            <Image
              height={20}
              width={20}
              src="icons/FileIcon.svg"
              alt="File icon"
              className="inline-block w-auto h-auto"
            />
            <p className="font-opensans font-normal text-[14px] text-[#000]">
              {file.name}
            </p>
          </button>
        ))}

        {children}
      </div>

      <ModalWindow isOpen={isOpenModal} onClose={handleCloseModal}>
        <FilePreviewContent
          closeModal={handleCloseModal}
          fullName={currentFile?.fullName || ''}
          preview={currentFile?.preview || ''}
          lastUpdated={currentFile?.lastUpdated || ''}
        />
      </ModalWindow>
    </div>
  );
};

export default FileList;
