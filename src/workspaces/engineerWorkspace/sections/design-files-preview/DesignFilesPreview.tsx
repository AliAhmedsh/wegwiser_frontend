import React from 'react';
import DesignPhoneIcon from '@/shared/icons/DesignPhoneIcon';

const DesignFilesPreview: React.FC = () => (
  <div className="flex flex-col bg-white h-[calc(100%-65px)] min-w-[340px] w-[40%] max-w-[500px] border-[#E8E8E8] relative justify-center">
    <div className="flex flex-row items-center justify-center gap-12 flex-1">
      <DesignPhoneIcon width={128} />
      <DesignPhoneIcon width={128} className="text-gray-300" />
    </div>
  </div>
);

export default DesignFilesPreview;
