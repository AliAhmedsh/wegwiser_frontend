import React from "react";

type ArrowBackIconProps = React.SVGProps<SVGSVGElement>;

const ArrowBackIcon: React.FC<ArrowBackIconProps> = (props) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width="18"
        height="19"
        viewBox="0 0 18 19"
        fill="none"
        {...props}
    >
        <path
            d="M11.67 4.37059L9.9 2.60059L0 12.5006L9.9 22.4006L11.67 20.6306L3.54 12.5006L11.67 4.37059Z"
            fill="currentColor"
        />
    </svg>
);

export default ArrowBackIcon;
