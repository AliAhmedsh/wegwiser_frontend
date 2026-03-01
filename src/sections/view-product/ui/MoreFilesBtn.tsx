import React from 'react';

interface MoreFilesBtnProps {
  filesAmount: number;
  filesToShowAmount: number;
  onClick: () => void;
}

const MoreFilesBtn: React.FC<MoreFilesBtnProps> = ({
  filesAmount,
  filesToShowAmount,
  onClick,
}) => {
  const moreCount = filesAmount - filesToShowAmount;

  if (moreCount <= 0) return <></>;

  return (
    <button
      onClick={onClick}
      className="font-sans font-normal text-[14px] text-[#000] cursor-pointer hover:underline"
      type="button"
    >
      +{moreCount} more files
    </button>
  );
};

export default MoreFilesBtn;
