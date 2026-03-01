import React from 'react';
import ArrowBackIcon from '@/shared/icons/ArrowBackIcon';
import { useWorkspaceStore } from '@/entities/workspace';

const Header: React.FC = () => {
  const { closeWorkspace } = useWorkspaceStore();

  return (
    <div className="flex gap-4 items-center justify-between p-5 bg-white w-full border-b border-[#E8E8E8]">
      <div className="flex items-center justify-center gap-4 cursor-pointer" onClick={closeWorkspace}>
        <div>
          <ArrowBackIcon height={24} />
        </div>
        <h2 className="text-base font-semibold">Engineering Workspace</h2>
      </div>
    </div>
  );
};

export default Header;
