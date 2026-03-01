import React from 'react';

const DesignPhoneIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 130 260"
      fill="currentColor"
      {...props}
    >
      <rect width="130" height="260" rx="12" fill="currentColor" />
      <rect x="4" y="235" width="123" height="21" rx="10.5" fill="white" />
      <rect x="4" y="49" width="123" height="77" rx="5" fill="white" />
      <rect x="4" y="133" width="53" height="61" rx="5" fill="white" />
      <rect x="61" y="133" width="53" height="61" rx="5" fill="white" />
      <path
        d="M117 138C117 135.239 119.239 133 122 133H127V194H122C119.239 194 117 191.761 117 189V138Z"
        fill="white"
      />
      <circle cx="116.5" cy="25.5" r="7" fill="white" stroke="#9D9D9D" />
      <g clipPath="url(#clip0)">
        <path
          d="M5.25 28.5H12.75V27.6667H5.25V28.5ZM5.25 26.4167H12.75V25.5833H5.25V26.4167ZM5.25 23.5V24.3333H12.75V23.5H5.25Z"
          fill="white"
        />
      </g>
      <defs>
        <clipPath id="clip0">
          <rect width="10" height="10" fill="white" transform="translate(4 21)" />
        </clipPath>
      </defs>
    </svg>
  );
};

export default DesignPhoneIcon;
