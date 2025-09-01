import type React from "react"
import { useState } from "react"
import { SwapTokenBox } from "@molecules"
import { SwapArrowIcon } from "@svgs"
import { SendBottomSection } from "./send-bottom-section"
import useMediaQuery from "use-media-antd-query"

export const SendSwap: React.FC = () => {
  const [fromValue, setFromValue] = useState("0.022")
  const [toValue, setToValue] = useState("0.022")
  const colSize = useMediaQuery()
  const isMbl = ["xs", "sm"].includes(colSize)

  const handleSwap = () => {
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
        balance={70.42}
        token="SOL"
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
            <SwapArrowIcon />
          </div>
        </button>

      <SwapTokenBox
        label="To"
        value={toValue}
        onChange={setToValue}
        token="SOL"
      />

      {/* Receiving wallets & distribution */}
      <SendBottomSection />
    </div>
  )
}
