"use client"
import { type ButtonHTMLAttributes } from "react"
import type React from "react"
import clsx from "clsx"

type ButtonVariant =
  | "linear-blue"
  | "purple-btn"
  | "main"
  | "contained"
  | "purple-light"
  | "gray-bold"

interface CustomButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  disabled?: boolean
  loading?: boolean
  labelClassName?: string
}

export const CustomButton: React.FC<CustomButtonProps> = ({
  variant = "main",
  disabled = false,
  loading = false,
  children,
  className,
  labelClassName,
  ...props
}) => {
  const linearBlue = clsx(
    "flex justify-center items-center gap-1 rounded-[16px] px-6 py-4 text-white font-medium",
    !disabled && "swap-btn-default-bg",
    "disabled:bg-[#A6A0BB] disabled:border-transparent disabled:cursor-not-allowed disabled:opacity-80"
  )

  const grayBold = clsx(
    "rounded-[16px] px-4 py-2 flex items-center h-[48px]",
    "connect-btn-default-bg"
  )

  return (
    <button
      className={clsx(
        variant === "gray-bold" && grayBold,
        variant === "linear-blue" && linearBlue,
        variant === "purple-light" &&
          "bg-[#A6A0BB] px-6 py-4 h-[56px] flex items-center justify-center ",
        className
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2"></span>
      )}
      <span className={labelClassName}>{children}</span>
    </button>
  )
}
