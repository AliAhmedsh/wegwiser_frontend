import React from "react";

type IconProps = {
  color?: string;
  size?: number;
  className?: string;
};

const HashtagIcon: React.FC<IconProps> = ({
  color = "currentColor",
  size = 24,
  className = "",
}) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 15 15"
    fill="none"
    className={className}
  >
    <path d="M3.7 14.29L3.7 0.71" stroke={color} strokeOpacity="0.7" strokeWidth="1.1561" strokeLinecap="round"/>
    <path d="M11.53 14.29L11.53 0.71" stroke={color} strokeOpacity="0.7" strokeWidth="1.1561" strokeLinecap="round"/>
    <path d="M0.82 3.58L14.41 3.58" stroke={color} strokeOpacity="0.7" strokeWidth="1.1561" strokeLinecap="round"/>
    <path d="M0.82 11.41L14.41 11.41" stroke={color} strokeOpacity="0.7" strokeWidth="1.1561" strokeLinecap="round"/>
  </svg>
);

export default HashtagIcon;
