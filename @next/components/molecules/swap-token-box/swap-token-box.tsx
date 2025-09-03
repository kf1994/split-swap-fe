"use client"

import { useMemo } from "react"
import type React from "react"
import { NumericTokenInput } from "@atoms"
import Image from "next/image"
import { userProfileStore } from "@store"
import { useShallow } from "zustand/react/shallow"
import { useTokenBalance, formatUSD, useUsdPrice } from "@hooks"
import { Spinner } from "../../../../src/components/ui/shadcn-io/spinner"

interface SwapInputBoxProps {
  label: string
  value: string
  section: "swap" | "send"
  onChange: (val: string) => void
}

// Helpers to safely read icon/name across shapes
const getIcon = (t: any): string => t?.icon || t?.logoURI || "/images/token.png"
const getName = (t: any): string => t?.name || t?.symbol || "Token"
const getSymbol = (t: any): string => (t?.symbol || "?").toUpperCase()

export const SwapTokenBox: React.FC<SwapInputBoxProps> = ({
  label,
  value,
  section,
  onChange
}) => {
  const [swap, send, setCurrentState, setActiveSelector, walletAddress] =
    userProfileStore(
      useShallow((s) => [
        s.swap,
        s.send,
        s.setCurrentState,
        s.setActiveSelector,
        s.walletAddress
      ])
    )

  const tokenBalance = useTokenBalance(
    walletAddress,
    section === "swap" ? swap.from.address : send.from.address
  )

  console.log("Wallet Address=>", walletAddress)
  const isFrom = label.toLowerCase() === "from"

  const handleActiveSelector = (): void => {
    setActiveSelector({
      section,
      side: isFrom ? "from" : "to"
    })
    setCurrentState("2")
  }

  // Pick token from store based on section + block
  const storeToken =
    section === "swap"
      ? isFrom
        ? swap.from
        : swap.to
      : isFrom
      ? send.from
      : send.to

  const displayToken = storeToken
  const symbol = getSymbol(displayToken) // read symbol from store
  const address = displayToken?.address as string | undefined // from store
  const chain = "solana"

  const {
    price: usdPerToken,
    loading: priceLoading,
    error: priceError
  } = useUsdPrice(symbol, address, chain)

  // Compute USD worth based on user input
  const numericValue = useMemo(() => {
    const n = Number(value)
    return Number.isFinite(n) ? n : 0
  }, [value])

  const usdWorth = useMemo(() => {
    if (usdPerToken == null) return null
    return numericValue * usdPerToken
  }, [numericValue, usdPerToken])

  console.log(
    "DisplayToken =>",
    displayToken,
    "symbol=",
    symbol,
    "usdPerToken=",
    usdPerToken
  )

  return (
    <div className="bg-[#383D56] rounded-xl p-4 flex flex-col gap-3 w-full">
      {/* Header */}
      <div className="flex justify-between items-center text-sm text-gray-400">
        <span className="text-[14px] text-white font-normal">{label}</span>
        <div className="flex gap-3 items-center">
          {label === "From" && (
            <span className="text-[14px] font-normal text-[#A6A0BB]">
              Balance:{" "}
              {tokenBalance.balance ? tokenBalance.balance.toFixed(3) : "--"}
            </span>
          )}
          {isFrom && (
            <>
              <button className="px-2 py-1 flex justify-center rounded-lg border border-[#46456C] hover:bg-[#46456C] hover:border-[#503EDC]">
                Half
              </button>
              <button className="px-2 py-1 flex justify-center rounded-lg border border-[#46456C] hover:bg-[#46456C] hover:border-[#503EDC]">
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
          setValue={(v) => {
            onChange(v)
          }}
          MAX_VALUE={Number.MAX_SAFE_INTEGER}
          MIN_VALUE={0}
          className="bg-transparent border-none outline-none text-[28px] font-bold w-full"
          connected
          // disabled={label === "To"}
        />

        <button
          onClick={handleActiveSelector}
          className={`flex items-center border border-transparent w-[250px] justify-between bg-[#444A66] hover:border-[#503EDC] px-3 py-2 rounded-xl text-white ${
            displayToken ? "font-bold" : "font-normal"
          }`}
        >
          {displayToken ? (
            <div className="flex items-center gap-2">
              <Image
                src={getIcon(displayToken)}
                alt={getName(displayToken)}
                width={24}
                height={24}
              />
              <p className={"w-[105px] flex truncate"}>{symbol}</p>
            </div>
          ) : (
            "Select"
          )}
          <Image
            src="/images/arrow-down.svg"
            alt="arrow"
            width={16}
            height={16}
          />
        </button>
      </div>

      {/* HARDCODED PLACE: show USD worth here */}
      {label === "From" && (
        <span className="text-xs text-gray-400">
          {priceLoading ? (
            <Spinner variant={"circle"} />
          ) : priceError ? (
            "—"
          ) : (
            formatUSD(usdWorth)
          )}
        </span>
      )}

      {/* If you also want to show for the To box, uncomment below:
      {label === "To" && (
        <span className="text-xs text-gray-400">{priceLoading ? "Fetching $ price…" : priceError ? "—" : formatUSD(usdWorth)}</span>
      )}
      */}
    </div>
  )
}
