import * as React from "react";

export const ArrowLeftIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width={24}
        height={24}
        viewBox="0 0 24 24"
        fill="none"
        {...props}
    >
        <g clipPath="url(#clip0_60_395)">
            <path
                d="M20 11H7.83L13.42 5.41L12 4L4 12L12 20L13.41 18.59L7.83 13H20V11Z"
                fill="white"
            />
        </g>
        <defs>
            <clipPath id="clip0_60_395">
                <rect width="24" height="24" fill="white" />
            </clipPath>
        </defs>
    </svg>
);
