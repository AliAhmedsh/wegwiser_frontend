import React from "react";

type IconProps = {
  color?: string;
  size?: number;
  className?: string;
};

const ShapesIcon: React.FC<IconProps> = ({
  color = "currentColor",
  size = 24,
  className = "",
}) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 16 17" fill="none" className={className}>
    <rect x="1.43449" y="10.6132" width="5.22094" height="5.22094" stroke={color} strokeOpacity="0.7" strokeWidth="1.1561"/>
    <rect x="4.19336" y="2.11436" width="4.23097" height="4.23097" transform="rotate(45 4.19336 2.11436)" stroke={color} strokeOpacity="0.7" strokeWidth="1.1561"/>
    <rect x="11.543" y="1.40538" width="4.93872" height="4.93872" rx="2.46936" transform="rotate(45 11.543 1.40538)" stroke={color} strokeOpacity="0.7" strokeWidth="1.1561"/>
    <path d="M11.6037 9.79883V13.0499M11.6037 16.1759V13.0499M8.65137 13.0499H11.6037M11.6037 13.0499H14.556" stroke={color} strokeOpacity="0.7" strokeWidth="1.1561" strokeLinecap="round"/>
  </svg>
);

export default ShapesIcon;
