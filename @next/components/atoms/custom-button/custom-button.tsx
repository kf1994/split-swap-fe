"use client";
import React, { ButtonHTMLAttributes } from "react";
import clsx from "clsx";

type ButtonVariant = "swap" | "connect";

interface CustomButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: ButtonVariant;
    disabled?: boolean;
}

export const CustomButton: React.FC<CustomButtonProps> = ({
                                                              variant = "swap",
                                                              disabled = false,
                                                              children,
                                                              className,
                                                              ...props
                                                          }) => {
    const swapClasses = clsx(
        "flex justify-center items-center gap-1 rounded-[16px] px-6 py-4 text-white font-medium ",
        !disabled && "swap-btn-default-bg",
        "disabled:bg-[#A6A0BB] disabled:border-transparent disabled:cursor-not-allowed disabled:opacity-80"
    );


    const connectClasses = clsx(
        "rounded-[16px] px-4 py-2 text-white font-bold ",
        "connect-btn-default-bg",
    );

    return (
        <button
            className={clsx(
                variant === "swap" ? swapClasses : connectClasses,
                className
            )}
            disabled={disabled}
            {...props}
        >
            {children}
        </button>
    );
};
