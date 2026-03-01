import React from "react";

type IconProps = {
  color?: string;
  size?: number;
  className?: string;
};

const InclinedStick: React.FC<IconProps> = ({
  color = "currentColor",
  size = 24,
  className = "",
}) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 15 17" fill="none" className={className}>
    <path d="M1.2334 16.0146L13.9505 0.985352" stroke={color} strokeOpacity="0.7" strokeWidth="1.1561" strokeLinecap="round"/>
  </svg>
);

export default InclinedStick;
