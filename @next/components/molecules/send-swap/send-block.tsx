import type React from "react"
import { useState } from "react"
import { SwapTokenBox } from "@molecules"
import { SwapArrowIcon } from "@svgs"
import { SendBottomSection } from "./send-bottom-section"
import { useTokenBalance } from "@hooks"
import { userProfileStore } from "@store"
import { useShallow } from "zustand/react/shallow"

export const SendBlock: React.FC = () => {
  const [fromValue, setFromValue] = useState("0.022")
  const [toValue, setToValue] = useState("0.022")
  const [send, walletAddress, setSendTo, setSendFrom] = userProfileStore(
    useShallow((s) => [s.send, s.walletAddress, s.setSendTo, s.setSendFrom])
  )

  const { balance } = useTokenBalance(walletAddress, send.from.address)
  const handleSwap = (): void => {
    setSendFrom(send?.to)
    setSendTo(send?.from)
  }

  return (
    <div className={"flex flex-col gap-1.5"}>
      {/* Top section (same as Swap tab) */}
      <SwapTokenBox
        label="From"
        value={fromValue}
        onChange={setFromValue}
        section={"send"}
        availableBalance={balance}
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
