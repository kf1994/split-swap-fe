import type React from "react"
import { useState } from "react"
import { SwapTokenBox } from "@molecules"
import { SwapArrowIcon } from "@svgs"
import { SendBottomSection } from "./send-bottom-section"

export const SendBlock: React.FC = () => {
  const [fromValue, setFromValue] = useState("0.022")
  const [toValue, setToValue] = useState("0.022")

  const handleSwap = (): void => {
    setFromValue(toValue)
    setToValue(fromValue)
  }

  return (
    <div className={"flex flex-col gap-1.5"}>
      {/* Top section (same as Swap tab) */}
      <SwapTokenBox
        label="From"
        value={fromValue}
        onChange={setFromValue}
        section={"send"}
      />

      {/* Swap Button */}
      <button
        onClick={handleSwap}
        className="relative flex items-center justify-center rounded-full swapper-icon-bg transition"
      >
        <div
          className={"absolute swapper-icon"}
          // style={{ left: isMbl ? "143px" : "245px" }}
        >
          <SwapArrowIcon className={"swap-btn-animation"} />
        </div>
      </button>

      <SwapTokenBox
        label="To"
        value={toValue}
        onChange={setToValue}
        section={"send"}
      />

      {/* Receiving wallets & distribution */}
      <SendBottomSection />
    </div>
  )
}
