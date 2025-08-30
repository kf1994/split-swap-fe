import type React from "react"
import { NumericTokenInput } from "@atoms"
import Image from "next/image" // example icon

interface SwapInputBoxProps {
  label: string
  value: string
  onChange: (val: string) => void
  balance?: number
  token: string
  onTokenChange?: (token: string) => void
  selectedToken?: string
}

export const SwapTokenBox: React.FC<SwapInputBoxProps> = ({
  label,
  value,
  onChange,
  balance,
  selectedToken,
  onTokenChange
}) => {
  return (
    <div className="bg-[#383D56] rounded-xl p-4 flex flex-col gap-3 w-full">
      {/* Header */}
      <div className="flex justify-between items-center text-sm text-gray-400">
        <span className={"text-[14px] text-white font-normal"}>{label}</span>
        <div className={"flex gap-3 items-center"}>
          {balance !== undefined && (
            <span className={"text-[14px] font-normal text-[#A6A0BB]"}>
              Balance: {balance}
            </span>
          )}
          {label === "From" && (
            <>
              <button className="px-2 py-1 flex justify-center rounded-lg border border-[#46456C]">
                Half
              </button>
              <button className="px-2 py-1 flex justify-center rounded-lg border border-[#46456C]">
                Full
              </button>
            </>
          )}
        </div>
      </div>

      {/* Input + Select */}
      <div className="flex justify-between items-center gap-2">
        <NumericTokenInput
          value={value}
          setValue={(value) => {
            onChange(value)
          }}
          MAX_VALUE={Number.MAX_SAFE_INTEGER}
          MIN_VALUE={0}
          className="bg-transparent border-none outline-none text-[28px] font-bold w-full"
          connected={true}
        />

        <div className="relative w-[168px]">
          <select
            value={selectedToken}
            onChange={(e) => onTokenChange?.(e.target.value)}
            className="appearance-none w-full bg-[#444A66] rounded-xl px-3 py-2 text-white text-[16px] font-bold pr-8" // extra pr-8 for arrow space
          >
            <option value="SOL">🔹 SOL</option>
            <option value="BTC">🟠 BTC</option>
            <option value="ETH">⚪ ETH</option>
          </select>

          {/* Custom dropdown icon (right aligned) */}
          <span className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-white">
            <Image
              src={"/images/arrow-down.svg"}
              alt={"Arrow down"}
              width={24}
              height={24}
            />
          </span>
        </div>
      </div>

      <span className="text-xs text-gray-400">$12.2272</span>
    </div>
  )
}
