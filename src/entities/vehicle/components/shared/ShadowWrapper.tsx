import React from 'react';

interface ShadowWrapperProps {
  children: React.ReactNode;
}

// box-shadow: 0px 5.62px 8.33px 0px #B6C1D1CC inset;

// box-shadow: 0px -6.55px 5.24px 0px #FFFFFF40 inset;

const ShadowWrapper: React.FC<ShadowWrapperProps> = ({ children }) => {
  return (
    <div
      className="rounded-full border-0 border-b-1 border-gray-50 w-full h-full flex justify-center items-center cursor-pointer"
      style={{
        boxShadow: '0px 5.62px 8.33px 0px #B6C1D1CC inset',
      }}
    >
      {children}
    </div>
  );
};

export default ShadowWrapper;
