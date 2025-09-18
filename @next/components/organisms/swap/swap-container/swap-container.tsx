"use client"
import type React from "react"
import { usePathname, useRouter } from "next/navigation"
import { useState } from "react"
import { SwapTokenBox, TokensList } from "@molecules"
import { SwapArrowIcon } from "@svgs"
import { SendBlock } from "../../../molecules/send-swap/send-block"
import { userProfileStore } from "@store"
import { useShallow } from "zustand/react/shallow"
import { CustomButton } from "@atoms"
import { usePrivateSwap } from "../../../../providers"

export const SwapContainer: React.FC = () => {
  const router = useRouter()
  const pathname = usePathname()
  const activeTab: "swap" | "send" = pathname.includes("send") ? "send" : "swap"

  const [fromValue, setFromValue] = useState("0.022")
  const [toValue, setToValue] = useState("0.022")

  const privateSwap = usePrivateSwap()
  const [currentState] = userProfileStore(useShallow((s) => [s.currentState]))

  const handleSwap = (): void => {
    setFromValue(toValue)
    setToValue(fromValue)
  }

  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  const handleTabClick = (tab: "swap" | "send") => {
    router.push(`/${tab}`) // updates URL but doesn’t reload
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
              <CustomButton
                disabled={false}
                onClick={() => {
                  console.log("clicked")
                  void privateSwap.integratePrivateSwap()
                }}
                variant={"swap"}
                className="w-full flex justify-center items-center mt-6 px-6 py-4 rounded-xl"
              >
                <p className={"text-[16px] font-bold"}>Swap</p>
              </CustomButton>
            </div>
          )}

          {/* Send Tab */}
          {activeTab === "send" && (
            <>
              <SendBlock />
              <CustomButton
                disabled={true}
                variant={"swap"}
                className="w-full flex justify-center items-center mt-6 px-6 py-4 rounded-xl"
              >
                <p className={"text-[16px] font-bold"}>Swap</p>
              </CustomButton>
            </>
          )}
        </div>
      )}
      {currentState === "2" && <TokensList />}
    </>
  )
}
