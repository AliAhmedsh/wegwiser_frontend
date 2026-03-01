import React from "react";

type MultiMenuIconProps = {
  color?: string;
  size?: number;
  className?: string;
};

const MultiMenuIcon: React.FC<MultiMenuIconProps> = ({
  color = "currentColor",
  size = 24,
  className = "",
}) => {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 17 17" fill="none" className={className}>
      <rect x="1.89153" y="10.1132" width="5.22094" height="5.22094" stroke={color} strokeOpacity="0.7" strokeWidth="1.1561"/>
      <rect x="4.65039" y="1.61436" width="4.23097" height="4.23097" transform="rotate(45 4.65039 1.61436)" stroke={color} strokeOpacity="0.7" strokeWidth="1.1561"/>
      <rect x="12" y="0.905375" width="4.93872" height="4.93872" rx="2.46936" transform="rotate(45 12 0.905375)" stroke={color} strokeOpacity="0.7" strokeWidth="1.1561"/>
      <path d="M12.0598 9.29883V12.5499M12.0598 15.6759V12.5499M9.10742 12.5499H12.0598M12.0598 12.5499H15.0121" stroke={color} strokeOpacity="0.7" strokeWidth="1.1561" strokeLinecap="round"/>
    </svg>
  );
};

export default MultiMenuIcon;
