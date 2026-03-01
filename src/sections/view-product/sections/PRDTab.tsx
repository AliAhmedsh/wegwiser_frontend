import React, { useState, useEffect, forwardRef } from 'react';

import ModalWindow from '@/shared/portals/ModalWindow';
import ProductWorkspace from '@/workspaces/productWorkspace/ProductWorkspace';
import TabHeader from '../ui/TabHeader';
import PRDItem from '../ui/PRDItem';
import FileList from './FileList';
import MoreFilesBtn from '../ui/MoreFilesBtn';

import { File } from '../types/files';

import { htmlPreview } from '../temp/tempPreview';
import { useSliderStore } from '@/store/sliderStore';
import { Open_Sans } from 'next/font/google';

interface PRDTabProps {
  lastUpdated: string;
  wrapperDataId: string;
}

const filesMockUp = [
  {
    id: '1',
    name: 'SWOT Analysis',
    fullName: 'SWOT Analysis for Search Feature Optimization',
    preview: htmlPreview,
    lastUpdated: '2025-01-01',
  },
  {
    id: '2',
    name: 'Market Research',
    fullName: 'Market Research for Search Feature Optimization',
    preview: htmlPreview,
    lastUpdated: '2025-05-12',
  },
  {
    id: '3',
    name: 'Product Research',
    fullName: 'Product Research for Search Feature Optimization',
    preview: htmlPreview,
    lastUpdated: '2025-05-22',
  },
  {
    id: '4',
    name: 'Product properties',
    fullName: 'Product properties for Search Feature Optimization',
    preview: htmlPreview,
    lastUpdated: '2025-12-08',
  },
];

const OpenSans400 = Open_Sans({
  weight: ['400'],
  subsets: ['cyrillic'],
});

const PRDTab = forwardRef<HTMLDivElement, PRDTabProps>(
  ({ lastUpdated, wrapperDataId }, ref) => {
    const [files] = useState<File[]>(filesMockUp);
    const [filesToShow, setFilesToShow] = useState<File[]>([]);
    const [isOpenWorkspace, setIsOpenWorkspace] = useState(false);
    const { hideAllTabs } = useSliderStore();

    const handleWorkspaceClose = () => {
      setIsOpenWorkspace(false);
    };

    useEffect(() => {
      setFilesToShow(files.slice(0, 2));
    }, [files]);

    return (
      <div
        data-tab-id={wrapperDataId}
        ref={ref}
        className="min-h-[calc(80vh-100px)] pt-1"
      >
        <div className="flex flex-row gap-6">
          <div className="flex-1">
            <TabHeader
              label="PRD"
              lastUpdated={lastUpdated}
              onEdit={() => {
                setIsOpenWorkspace(true);
              }}
            />
          </div>
          <button
            className={`bg-[#EAEDF2] flex items-center justify-center text-[#535354] w-[150px] h-[34px] text-[14px] py-2 rounded-md cursor-pointer ${OpenSans400.className}`}
            style={{
              boxShadow: '2px 2px 2px 0px #A7B1C499, -2px -2px 2px 0px #FFFFFF',
            }}
            onClick={() => {
              hideAllTabs();
              setIsOpenWorkspace(true);
            }}
          >
            Product Workspace
          </button>
        </div>
        <div className="flex flex-col gap-6.5">
          <PRDItem
            featureName="Feature Name"
            description="Search Function Optimization"
          />
          <PRDItem
            featureName="Goal"
            description="Improve search result relevancy and speed"
          />
          <PRDItem
            featureName="Success Metrics"
            description="Decrease search time by 20%, improve accuracy by 15%"
          />
          <PRDItem
            featureName="Dependencies"
            description="Requires backend integration and frontend UI changes"
          />
          <FileList filesAmount={files.length} files={filesToShow}>
            <MoreFilesBtn
              filesAmount={files.length}
              filesToShowAmount={filesToShow.length}
              onClick={() => setFilesToShow(files)}
            />
          </FileList>
        </div>

        <ModalWindow isOpen={isOpenWorkspace} onClose={handleWorkspaceClose}>
          <ProductWorkspace />
        </ModalWindow>
      </div>
    );
  }
);

PRDTab.displayName = 'PRDTab';

export default PRDTab;
