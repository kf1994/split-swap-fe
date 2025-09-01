"use client"
import React, { ButtonHTMLAttributes } from "react";
import clsx from "clsx";

interface WalletButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    disabled?: boolean;
}

export const CustomButton: React.FC<WalletButtonProps> = ({
                                                              disabled = false,
                                                              children,
                                                              className,
                                                              ...props
                                                          }) => {
    return (
        <button
            className={clsx(
                "flex gap-2 items-center px-4 py-2 text-white text-[14px] font-normal rounded-[16px] transition-all duration-200",
                !disabled &&
                "bg-[linear-gradient(81deg,rgba(136,147,162,0.80)_41.26%,rgba(163,171,183,1.2)_58.85%)] hover:border-[#3522CF] hover:bg-[#6963FF] active:border-[#503EDC] active:bg-[radial-gradient(179.17% 50% at 50% 50%, #635EE3 0%, rgba(142, 130, 255, 0.00) 100%), #4235AC]",
                disabled && "bg-[#A6A0BB] cursor-not-allowed opacity-80",
                className
            )}
            disabled={disabled}
            {...props}
        >
            {children}
        </button>
    );
};
