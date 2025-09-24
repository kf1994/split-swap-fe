import type React from "react"
import { MinusCircleIcon } from "@svgs"

interface SendWalletRowProps {
  address: string
  percentage: string
  onAddressChange: (v: string) => void
  onPercentageChange: (v: number) => void
  onRemove?: () => void
}

export const SendWalletInput: React.FC<SendWalletRowProps> = ({
  address,
  percentage,
  onAddressChange,
  onPercentageChange,
  onRemove
}) => {
  console.log("===>", percentage)
  return (
    <div className="flex items-center gap-2 mt-1">
      {/* Address input */}
      <div className="flex-1">
        <input
          placeholder="Wallet address"
          value={address}
          onChange={(e) => {
            onAddressChange(e.target.value)
          }}
          className="
            p-3 w-full rounded-xl
            border border-[#46456C]
            bg-[#383D56]
            px-4 text-sm text-white placeholder-[#8F8AA7]
            outline-none focus:border-[#46456C]
          "
        />
      </div>

      {/* Percentage input with % suffix */}
      <div className="w-[107px]">
        <div className="relative">
          <input
            type="number"
            inputMode="decimal"
            min={0}
            max={100}
            step="0.01"
            value={percentage === "" ? "" : String(Number(percentage))}
            onChange={(e) => {
              onPercentageChange(Number(e.target.value))
            }}
            className="
              p-3 w-full rounded-xl
              border border-[#46456C]
              bg-[#383D56]
              text-sm text-white
              outline-none focus:border-[#46456C]
              [appearance:textfield]
              [&::-webkit-outer-spin-button]:appearance-none
              [&::-webkit-inner-spin-button]:appearance-none
            "
          />
          <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-sm text-[#A6A0BB]">
            %
          </span>
        </div>
      </div>

      {/* Optional remove button */}
      {onRemove && (
        <button
          type="button"
          onClick={onRemove}
          className="ml-1"
          aria-label="Remove address row"
          title="Remove"
        >
          <MinusCircleIcon />
        </button>
      )}
    </div>
  )
}
