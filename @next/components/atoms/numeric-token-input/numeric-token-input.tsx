"use client"

import { formatSol, clsxm } from "@utils"
import { type ChangeEvent, type FocusEvent, memo, useRef } from "react"
import { type NumericInputProps } from "./numeric-token-input.types"

export const NumericTokenInput = memo(
  ({
    value,
    setValue,
    connected,
    hideInputBtns = false,
    MIN_VALUE,
    MAX_VALUE,
    size = "l",
    disabled = false,
    refresh,
    className,
    allowedDigit = 4,
    placeholder
  }: NumericInputProps) => {
    const refreshTimeoutRef = useRef<null | ReturnType<typeof setTimeout>>(null)

    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value.replace(/[^0-9.]/g, "")
      // Prevent multiple decimals
      if ((newValue.match(/\./g) ?? []).length > 1) return

      const [intPart = "", decimalPart = ""] = newValue.split(".")
      if ((intPart + decimalPart).length > allowedDigit) return
      if (decimalPart?.length > 4) return
      if ((decimalPart.match(/0/g) ?? []).length > 3) return

      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current)
      }

      if (newValue === "") {
        setValue(newValue as unknown as string)
      } else {
        if (Number.parseFloat(newValue) < MIN_VALUE) {
          setValue(MIN_VALUE.toString())
        }
        const numericValue = parseFloat(newValue)
        setValue(newValue)
        if (numericValue > 0 && refresh) {
          refreshTimeoutRef.current = setTimeout(() => {
            refresh()
          }, 500)
        }
      }
    }

    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    const handleBlur = (e: FocusEvent<HTMLInputElement>) => {
      let inputValue = e.target.value
        .replace(/[^0-9.]/g, "") // Remove non-numeric and non-decimal characters
        .replace(/(\.\d*?)0+\b/g, "$1") // Remove trailing zeros after decimal point
        .replace(/\.{2,}/g, ".") // Remove consecutive dots (multiple decimal points)
        .replace(/^0+(\d+)/, "$1") // Remove leading zeros
        .slice(0, 9) // Limit length to 9 characters

      const parts = inputValue.split(".")
      if (parts.length > 2) {
        inputValue = `${parts[0]}.${parts[1].replace(/(\d*?)0+\b/g, "$1")}`
      } else if (parts.length === 2 && parts[1] === "") {
        inputValue = parts[0]
      }

      if (inputValue === "") {
        setValue(formatSol(MIN_VALUE))
      } else {
        const numericValue = Number(inputValue)
        if (numericValue < MIN_VALUE) {
          setValue(formatSol(MIN_VALUE))
        } else if (numericValue > 1) {
          setValue(formatSol(numericValue))
        } else if (numericValue > 0 && numericValue <= 0.00001) {
          setValue("0.00001")
        } else if (inputValue === "0.0000000") {
          setValue("0.00001")
        } else if (Number(value) < MIN_VALUE) {
          setValue(MIN_VALUE.toString())
        } else {
          setValue(inputValue)
        }
      }
    }

    return (
      <input
        className={clsxm(
          "rounded-none bg-transparent px-0 focus:border-0 focus:border-transparent text-white focus:outline-none placeholder:!font-normal",
          { "no-spinners": hideInputBtns },
          {
            "text-base": connected && parseFloat(value.toString()) > MAX_VALUE
          },
          { "input h-[30px] w-full text-xl font-bold": size === "l" },
          className
        )}
        disabled={disabled}
        step={0.1}
        type="string"
        placeholder={placeholder}
        value={value}
        onBlur={handleBlur}
        onChange={handleChange}
      />
    )
  }
)
