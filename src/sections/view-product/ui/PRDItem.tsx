import { Open_Sans } from 'next/font/google';
import React from 'react';

interface PRDItemProps {
  featureName: string;
  description: string;
}

const OpenSans600 = Open_Sans({
  weight: ['600'],
  subsets: ['cyrillic'],
});

const PRDItem: React.FC<PRDItemProps> = ({ featureName, description }) => {
  return (
    <div className="flex flex-row items-center gap-4 mt-4">
      <h4
        className={`min-w-[135px] font-poppins font-semibold text-[16px] text-[#181818] ${OpenSans600.className}`}
      >
        {featureName}
      </h4>

      <p className="font-sans font-normal text-[14px] text-[#000]">
        {description}
      </p>
    </div>
  );
};

export default PRDItem;
