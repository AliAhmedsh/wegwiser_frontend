import React from "react";

type IconProps = {
  color?: string;
  size?: number;
  className?: string;
};

const TextIcon: React.FC<IconProps> = ({
  color = "currentColor",
  size = 24,
  className = "",
}) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 15 15" fill="none" className={className}>
    <path d="M0.950195 3.96475V2.10472C0.950195 1.67905 1.29526 1.33398 1.72093 1.33398H7.50141M14.0526 3.96475V2.10472C14.0526 1.67905 13.7076 1.33398 13.2819 1.33398H7.50141M7.50141 1.33398V13.6657M7.50141 13.6657H5.04471M7.50141 13.6657H10.1219" stroke={color} strokeOpacity="0.9" strokeWidth="1.1561" strokeLinecap="round"/>
  </svg>
);

export default TextIcon;
