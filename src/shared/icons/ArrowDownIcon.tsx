import React from "react";

type ArrowDownIconProps = React.SVGProps<SVGSVGElement>;

const ArrowDownIcon: React.FC<ArrowDownIconProps> = (props) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width="10"
        height="7"
        viewBox="0 0 10 7"
        fill="none"
        {...props}
    >
        <path
            d="M0.885 0.50045L-2.16371e-07 1.38545L4.95 6.33545L9.9 1.38545L9.015 0.500449L4.95 4.56545L0.885 0.50045Z"
            fill="currentColor"
        />
    </svg>
);

export default ArrowDownIcon;
