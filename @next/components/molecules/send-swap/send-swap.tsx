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
    <>
      {/* Top section (same as Swap tab) */}
      <SwapTokenBox
        label="From"
        value={fromValue}
        onChange={setFromValue}
        balance={70.42}
        token="SOL"
      />

      {/* Swap Button */}
      <div className="flex justify-center ">
        <button
          onClick={handleSwap}
          className="flex items-center justify-center rounded-full swapper-icon-bg transition"
        >
          <div
            className={"swapper-icon"}
            style={{ left: isMbl ? "143px" : "245px" }}
          >
            <SwapArrowIcon />
          </div>
        </button>
      </div>

      <SwapTokenBox
        label="To"
        value={toValue}
        onChange={setToValue}
        token="SOL"
      />

      {/* Receiving wallets & distribution */}
      <SendBottomSection />
    </>
  )
}
