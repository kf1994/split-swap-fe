import React from "react";

interface SwapIconProps extends React.SVGProps<SVGSVGElement> {
    size?: number;
    color?: string;
}

export const SwapArrowsIcon: React.FC<SwapIconProps> = ({
   size = 18,
   color = "#A6A0BB",
   ...props
}) => {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width={size}
            height={(size * 14) / 18} // keep aspect ratio
            viewBox="0 0 18 14"
            fill="none"
            {...props}
        >
            <path
                d="M3.99 6L0 10L3.99 14V11H11V9H3.99V6ZM18 4L14.01 0V3H7V5H14.01V8L18 4Z"
                fill={color}
            />
        </svg>
    );
};
