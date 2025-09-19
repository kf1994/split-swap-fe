import type React from "react"
import { useEffect, useState } from "react"
import { SwapTokenBox } from "@molecules"
import { SwapArrowIcon } from "@svgs"
import { SendBottomSection } from "./send-bottom-section"
import { useTokenBalance, useUsdPrice } from "@hooks"
import { userProfileStore } from "@store"
import { useShallow } from "zustand/react/shallow"

export const SendBlock: React.FC = () => {
  const [fromValue, setFromValue] = useState("0.022")
  const [toValue, setToValue] = useState("0.022")
  const [send, walletAddress, setSendTo, setSendFrom] = userProfileStore(
    useShallow((s) => [s.send, s.walletAddress, s.setSendTo, s.setSendFrom])
  )
  const { price: fromTokenPrice } = useUsdPrice(
    send.from?.symbol,
    send.from?.address,
    "solana"
  )

  const { price: toTokenPrice } = useUsdPrice(
    send.to?.symbol,
    send.to?.address,
    "solana"
  )
  const { balance } = useTokenBalance(walletAddress, send.from.address)

  useEffect(() => {
    if (fromTokenPrice && toTokenPrice) {
      const fromValueNum = Number(fromValue) || 0
      const usdWorth = fromValueNum * fromTokenPrice
      const toAmount = usdWorth / toTokenPrice
      setToValue(toAmount.toFixed(6)) // 6 decimals
    }
  }, [fromValue, fromTokenPrice, toTokenPrice])
  const handleSwap = (): void => {
    // setFromValue(toValue)
    // setToValue(fromValue)
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
        usdPerToken={fromTokenPrice}
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
