import React from "react";

type MouseIconProps = {
  color?: string;
  size?: number;
  className?: string;
};

const MouseIcon: React.FC<MouseIconProps> = ({
  color = "currentColor",
  size = 24,
  className = "",
}) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 16 17"
      fill="none"
      className={className}
    >
      <path
        d="M0.369102 0.8692C0.778591 0.52796 1.39299 0.391443 1.87075 0.596207L15.1808 6.12509C15.7268 6.32984 16 6.80757 16 7.42197C16 8.03621 15.6588 8.44585 15.1126 8.65061L10.1299 10.63L8.15056 15.6126C7.94581 16.1586 7.46808 16.5 6.92191 16.5C6.37591 16.5 5.89802 16.1588 5.69326 15.6808L0.0962763 2.37084C-0.108641 1.89309 0.0280275 1.27872 0.36927 0.869205L0.369102 0.8692ZM6.92161 15.2028L9.17415 9.67388L14.7031 7.42153L1.39299 1.89265L6.92161 15.2028Z"
        fill={color}
      />
    </svg>
  );
};

export default MouseIcon;
