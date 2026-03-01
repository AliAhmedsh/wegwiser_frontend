import DesignAssetsTab from '@/sections/designAssetsTab/DesignAssetsTab';
import DesignFilesTab from '@/sections/designFilesTab/DesignFilesTab';
import DesignTasksTab from '@/sections/designTasksTab/DesignTasksTab';
import { Poppins } from 'next/font/google';
import { useEffect, useRef, useState } from 'react';

const TABS = [
  { key: 'files', label: 'Design Files' },
  { key: 'tasks', label: 'Tasks' },
  { key: 'assets', label: 'Assets' },
];

const Poppins800 = Poppins({
  weight: ['800'],
  subsets: ['latin'],
});

interface DesignPanelProps {
  workspaceId?: number;
  isVisible?: boolean;
}

export default function DesignPanel({ workspaceId, isVisible }: DesignPanelProps) {
  const [activeTab, setActiveTab] = useState('files');
  const [hasOpened, setHasOpened] = useState(
    isVisible === undefined ? true : isVisible
  );
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const hasTriggeredInitialRef = useRef(false);
  const wasVisibleRef = useRef(isVisible ?? true);

  useEffect(() => {
    const currentlyVisible = isVisible ?? true;

    if (!hasTriggeredInitialRef.current) {
      if (currentlyVisible) {
        setHasOpened(true);
        setRefreshTrigger((prev) => prev + 1);
      }
      hasTriggeredInitialRef.current = true;
      wasVisibleRef.current = currentlyVisible;
      return;
    }

    if (currentlyVisible && !wasVisibleRef.current) {
      setHasOpened(true);
      setRefreshTrigger((prev) => prev + 1);
    }

    wasVisibleRef.current = currentlyVisible;
  }, [isVisible]);

  const shouldRenderTabs = isVisible === undefined ? true : isVisible || hasOpened;
  const effectiveWorkspaceId = workspaceId;

  return (
    <div className="w-full h-full grid grid-rows-[auto_1fr] overflow-hidden pt-7 pl-7 pb-8 pr-5 ">
      <div className="flex gap-8 mb-6">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            className={`pb-2 font-semibold transition-colors text-[#535354] cursor-pointer ${Poppins800.className
              } ${activeTab === tab.key && 'border-b-4 border-[#627899]'}`}
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="overflow-y-auto relative">
        {shouldRenderTabs && (
          <>
            <div className={activeTab === 'files' ? 'block' : 'hidden'}>
              <DesignFilesTab workspaceId={effectiveWorkspaceId} refreshTrigger={refreshTrigger} />
            </div>
            <div className={activeTab === 'tasks' ? 'block' : 'hidden'}>
              <DesignTasksTab workspaceId={effectiveWorkspaceId} refreshTrigger={refreshTrigger} />
            </div>
            <div className={activeTab === 'assets' ? 'block' : 'hidden'}>
              <DesignAssetsTab workspaceId={effectiveWorkspaceId} refreshTrigger={refreshTrigger} />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
