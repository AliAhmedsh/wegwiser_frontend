import React from "react";

type FrameIconProps = {
  color?: string;
  size?: number;
  className?: string;
};

const FrameIcon: React.FC<FrameIconProps> = ({
  color = "currentColor",
  size = 24,
  className = "",
}) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 22 22"
      fill="none"
      className={className}
    >
      <path d="M7.39074 17.7938L7.3883 4.20663" stroke={color} strokeWidth={1.1561} strokeLinecap="round" />
      <path d="M15.2237 17.7938L15.2213 4.20663" stroke={color} strokeWidth={1.1561} strokeLinecap="round" />
      <path d="M4.51189 7.08507L18.099 7.08264" stroke={color} strokeWidth={1.1561} strokeLinecap="round" />
      <path d="M4.51189 14.9181L18.099 14.9156" stroke={color} strokeWidth={1.1561} strokeLinecap="round" />
    </svg>
  );
};

export default FrameIcon;
