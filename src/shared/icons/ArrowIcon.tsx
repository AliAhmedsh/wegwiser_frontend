import React from "react";

type ArrowIconProps = {
  color?: string;
  size?: number;
  className?: string;
};

const ArrowIcon: React.FC<ArrowIconProps> = ({
  color = "currentColor",
  size = 24,
  className = "",
}) => {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 9 11" fill="none" className={className}>
      <path d="M0.703993 9.76977C0.576842 9.93325 0.606292 10.1689 0.769772 10.296C0.933252 10.4232 1.16886 10.3937 1.29601 10.2302L0.703993 9.76977ZM8.3721 0.953487C8.34642 0.747979 8.15899 0.602207 7.95349 0.627896L4.60455 1.04651C4.39904 1.0722 4.25327 1.25962 4.27896 1.46513C4.30465 1.67064 4.49207 1.81641 4.69758 1.79072L7.67441 1.41862L8.04651 4.39545C8.0722 4.60096 8.25962 4.74673 8.46513 4.72104C8.67064 4.69535 8.81641 4.50793 8.79072 4.30242L8.3721 0.953487ZM1 10L1.29601 10.2302L8.29601 1.23023L8 1L7.70399 0.769772L0.703993 9.76977L1 10Z" fill={color}/>
    </svg>
  );
};

export default ArrowIcon;
