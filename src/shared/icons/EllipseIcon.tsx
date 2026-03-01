import React from "react";

type IconProps = {
  color?: string;
  size?: number;
  className?: string;
};

const EllipseIcon: React.FC<IconProps> = ({
  color = "currentColor",
  size = 24,
  className = "",
}) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 16 16" fill="none" className={className}>
    <ellipse cx="8" cy="8" rx="6" ry="4" stroke={color} strokeWidth="1.5" fill="none"/>
  </svg>
);

export default EllipseIcon;
