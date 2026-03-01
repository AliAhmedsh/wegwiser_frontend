import React from "react";

type IconProps = {
  color?: string;
  size?: number;
  className?: string;
};

const HexagonIcon: React.FC<IconProps> = ({
  color = "currentColor",
  size = 24,
  className = "",
}) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 16 16" fill="none" className={className}>
    <path d="M8 2L13.196 5.5V10.5L8 14L2.804 10.5V5.5L8 2Z" stroke={color} strokeWidth="1.5" fill="none"/>
  </svg>
);

export default HexagonIcon;
