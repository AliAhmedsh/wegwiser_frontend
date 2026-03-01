import React from "react";

type LineIconProps = {
  color?: string;
  size?: number;
  className?: string;
};

const LineIcon: React.FC<LineIconProps> = ({
  color = "currentColor",
  size = 24,
  className = "",
}) => {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 14 18" fill="none" className={className}>
      <path d="M0.689453 16.5146L13.4065 1.48535" stroke={color} strokeOpacity={0.7} strokeWidth={1.1561} />
    </svg>
  );
};

export default LineIcon;
