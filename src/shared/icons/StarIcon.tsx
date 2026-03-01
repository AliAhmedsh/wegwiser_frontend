import React from "react";

type IconProps = {
  color?: string;
  size?: number;
  className?: string;
};

const StarIcon: React.FC<IconProps> = ({
  color = "currentColor",
  size = 24,
  className = "",
}) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 16 16" fill="none" className={className}>
    <path d="M8 2L9.5 5.5L13 6L10.25 8.5L11 12L8 10L5 12L5.75 8.5L3 6L6.5 5.5L8 2Z" stroke={color} strokeWidth="1.5" fill="none"/>
  </svg>
);

export default StarIcon;
