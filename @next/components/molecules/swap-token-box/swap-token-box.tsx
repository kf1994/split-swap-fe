import React from "react"
import { NumericTokenInput } from "@atoms"
import Image from "next/image"
import { userProfileStore } from "@store"
import { useShallow } from "zustand/react/shallow"
import {useTokenBalance} from "@hooks";
import {SOL_ADDRESS} from "@config";

interface SwapInputBoxProps {
    label: string
    value: string
    section: "swap" | "send"
    onChange: (val: string) => void
}

// Helpers to safely read icon/name across shapes
const getIcon = (t: any) => t?.icon || t?.logoURI || "/images/token.png"
const getName = (t: any) => t?.name || t?.symbol || "Token"
const getSymbol = (t: any) => t?.symbol || "?"

export const SwapTokenBox: React.FC<SwapInputBoxProps> = ({ label, value, section, onChange }) => {

    const [
        swap,
        send,
        setCurrentState,
        setActiveSelector,
        walletAddress
    ] = userProfileStore(
        useShallow((s) => [
            s.swap,
            s.send,
            s.setCurrentState,
            s.setActiveSelector,
            s.walletAddress
        ])
    )
    const tokenBalance = useTokenBalance(walletAddress, section === "swap" ? swap.from.address: send.from.address)
    // const usdc = useTokenBalance(walletAddress, "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v")
    const handleActiveSelector = () => {
        setActiveSelector({
            section,
            side: isFrom ? "from" : "to",
        })
        setCurrentState("2")
    }


    const isFrom = label.toLowerCase() === "from"

    // Pick token from store based on section + block
    const storeToken =
        section === "swap"
            ? (isFrom ? swap.from : swap.to)
            : (isFrom ? send.from : send.to)

    // Defaults come from the store
    const displayToken = storeToken
    console.log("DisplayTOken=>",displayToken)

    return (
        <div className="bg-[#383D56] rounded-xl p-4 flex flex-col gap-3 w-full">
            {/* Header */}
            <div className="flex justify-between items-center text-sm text-gray-400">
                <span className="text-[14px] text-white font-normal">{label}</span>
                <div className="flex gap-3 items-center">
                    {label === "From" &&
                        <span className="text-[14px] font-normal text-[#A6A0BB]">Balance: {tokenBalance.balance ?? "--"}</span>
                    }
                    {isFrom && (
                        <>
                            <button className="px-2 py-1 flex justify-center rounded-lg border border-[#46456C] hover:bg-[#46456C] hover:border-[#503EDC]">Half</button>
                            <button className="px-2 py-1 flex justify-center rounded-lg border border-[#46456C] hover:bg-[#46456C] hover:border-[#503EDC]">Full</button>
                        </>
                    )}
                </div>
            </div>

            {/* Input + Select */}
            <div className="flex justify-between items-center gap-2">
                <NumericTokenInput
                    value={value}
                    setValue={(v) => onChange(v)}
                    MAX_VALUE={Number.MAX_SAFE_INTEGER}
                    MIN_VALUE={0}
                    className="bg-transparent border-none outline-none text-[28px] font-bold w-full"
                    connected
                    disabled={label === "To"}
                 />

                <button
                    onClick={handleActiveSelector}
                    className={`flex items-center border border-transparent w-[250px] justify-between bg-[#444A66] hover:border-[#503EDC] px-3 py-2 rounded-xl text-white ${displayToken ? "font-bold" : "font-normal"}`}
                >
                    {displayToken ? (
                        <div className="flex items-center gap-2">
                            <Image src={getIcon(displayToken)} alt={getName(displayToken)} width={24} height={24} />
                            {getSymbol(displayToken)}
                        </div>
                    ) : (
                        "Select"
                    )}
                    <Image src="/images/arrow-down.svg" alt="arrow" width={16} height={16} />
                </button>
            </div>
            {label === "From" &&
                <span className="text-xs text-gray-400">$12.2272</span>
            }
        </div>
    )
}
