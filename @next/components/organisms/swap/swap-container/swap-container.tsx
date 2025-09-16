"use client"
import type React from "react"
import { useState } from "react"
import { SwapTokenBox, TokensList } from "@molecules"
import { SwapArrowIcon } from "@svgs"
import { SendSwap } from "../../../molecules/send-swap/send-swap"
import useMediaQuery from "use-media-antd-query"
import { userProfileStore } from "@store"
import { useShallow } from "zustand/react/shallow"
import { CustomButton } from "@atoms"
import { usePrivateSwap } from "../../../../providers"

export const SwapContainer: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"swap" | "send">("swap")
  const [fromValue, setFromValue] = useState("0.022")
  const [toValue, setToValue] = useState("0.022")

  const privateSwap = usePrivateSwap()

  const colSize = useMediaQuery()
  const isMbl = ["xs", "sm"].includes(colSize)

  const handleSwap = () => {
    setFromValue(toValue)
    setToValue(fromValue)
  }
  const [currentState] = userProfileStore(useShallow((s) => [s.currentState]))

  return (
    <>
      {currentState === "1" && (
        <div
          className="
            rounded-2xl p-6
            w-[343px] md:w-[530px]
            mx-auto
            swap-container
          "
        >
          {/* Custom Tabs */}
          <div className="flex gap-6">
            {["swap", "send"].map((tab) => (
              <button
                key={tab}
                onClick={() => {
                  setActiveTab(tab as "swap" | "send")
                }}
                className={`pb-1.5 text-[20px] sm:text-[22px] font-bold transition ${
                  activeTab === tab ? "text-white" : "text-[#A6A0BB]"
                }`}
              >
                {tab === "swap" ? "Swap" : "Send"}
              </button>
            ))}
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
                  <SwapArrowIcon />
                </div>
              </button>

              <SwapTokenBox
                label="To"
                value={toValue}
                onChange={setToValue}
                section={"swap"}
              />

              {/* Swap CTA */}
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
              <SendSwap />
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
