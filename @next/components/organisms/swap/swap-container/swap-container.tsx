"use client"
import type React from "react"
import { usePathname, useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { SwapTokenBox, TokensList } from "@molecules"
import { SwapArrowIcon } from "@svgs"
import { SendBlock } from "../../../molecules/send-swap/send-block"
import { userProfileStore } from "@store"
import { useShallow } from "zustand/react/shallow"
import { ActionMainButton } from "@atoms"
import { usePrivateSwap } from "../../../../providers"
import { useTokenBalance, useUsdPrice } from "@hooks"
import { getActionMainButtonMode } from "@next/utils/get-action-main-button-mode"
import { useWallet } from "@solana/wallet-adapter-react"

export const SwapContainer: React.FC = () => {
  const router = useRouter()
  const pathname = usePathname()
  const activeTab: "swap" | "send" = pathname.includes("send") ? "send" : "swap"
  const [swap, walletAddress, setSwapFrom, setSwapTo] = userProfileStore(
    useShallow((s) => [s.swap, s.walletAddress, s.setSwapFrom, s.setSwapTo])
  )
  const { price: fromTokenPrice } = useUsdPrice(
    swap.from?.symbol,
    swap.from?.address,
    "solana"
  )

  const { price: toTokenPrice } = useUsdPrice(
    swap.to?.symbol,
    swap.to?.address,
    "solana"
  )

  const { connected } = useWallet()
  const { balance } = useTokenBalance(walletAddress, swap.from.address)
  const [fromValue, setFromValue] = useState("0.022")
  const [toValue, setToValue] = useState("0.022")
  const [loading, setLoading] = useState(false)
  const privateSwap = usePrivateSwap()
  const [currentState] = userProfileStore(useShallow((s) => [s.currentState]))

  const handleSwap = (): void => {
    // setFromValue(toValue)
    // setToValue(fromValue)
    setSwapFrom(swap?.to)
    setSwapTo(swap?.from)
  }
  const actionMainButtonMode = getActionMainButtonMode({
    isOnline: true,
    connected,
    confirming: false,
    solInput: fromValue?.toString(),
    maxAvailableFunds: balance ?? 0,
    loading: loading
  })
  useEffect(() => {
    if (fromTokenPrice && toTokenPrice) {
      const fromValueNum = Number(fromValue) || 0
      const usdWorth = fromValueNum * fromTokenPrice
      const toAmount = usdWorth / toTokenPrice
      setToValue(toAmount.toFixed(6)) // 6 decimals
    }
  }, [fromValue, fromTokenPrice, toTokenPrice])
  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  const handleTabClick = (tab: "swap" | "send") => {
    router.push(`/${tab}`) // updates URL but doesn’t reload
  }
  const swapHandler = async () => {
    try {
      if (swap.from && swap.to && walletAddress) {
        setLoading(true)
        const res = await privateSwap.integratePrivateSwap(
          swap.from.address,
          swap.to.address,
          fromValue,
          swap.from.decimals ?? 6,
          walletAddress
        )
        setLoading(false)
      }
    } catch (error) {
      setLoading(false)
    }
  }
  return (
    <>
      {currentState === "1" && (
        <div className="rounded-2xl p-6 w-[343px] md:w-[530px] mx-auto swap-container">
          {/* Tabs */}
          <div className="flex gap-6">
            <button
              onClick={() => {
                handleTabClick("swap")
              }}
              className={`pb-1.5 text-[20px] sm:text-[22px] font-bold transition ${
                activeTab === "swap" ? "text-white" : "text-[#A6A0BB]"
              }`}
            >
              Swap
            </button>
            <button
              onClick={() => {
                handleTabClick("send")
              }}
              className={`pb-1.5 text-[20px] sm:text-[22px] font-bold transition ${
                activeTab === "send" ? "text-white" : "text-[#A6A0BB]"
              }`}
            >
              Send
            </button>
          </div>

          {/* Only show when tab is swap */}
          {activeTab === "swap" && (
            <div className={"flex flex-col gap-1.5"}>
              <SwapTokenBox
                label="From"
                value={fromValue}
                onChange={setFromValue}
                section={"swap"}
                availableBalance={balance}
                usdPerToken={fromTokenPrice}
              />

              {/* Swap Button */}
              <button
                onClick={handleSwap}
                className="relative flex items-center justify-center rounded-full swapper-icon-bg transition"
              >
                <div
                  className="absolute swapper-icon"
                  // style={{left: isMbl ? "150px" : "245px"}}
                >
                  <SwapArrowIcon className={"swap-btn-animation"} />
                </div>
              </button>

              <SwapTokenBox
                label="To"
                value={toValue}
                onChange={setToValue}
                section={"swap"}
              />
              <ActionMainButton
                actionMainButtonMode={actionMainButtonMode}
                loading={loading}
                className="w-full flex justify-center items-center mt-6 px-6 py-4 rounded-xl"
                labelClassName={"text-white text-[16px] font-bold"}
                swap={swapHandler}
              />
            </div>
          )}

          {/* Send Tab */}
          {activeTab === "send" && (
            <>
              <SendBlock />
            </>
          )}
        </div>
      )}
      {currentState === "2" && <TokensList />}
    </>
  )
}
