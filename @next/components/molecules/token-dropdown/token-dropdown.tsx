"use client"

import React, { useState, useEffect, useRef } from "react"
import Image from "next/image"
import { ArrowLeftIcon, StarIcon } from "@svgs"
import {userProfileStore} from "../../../store/use-profile-store";
import {useShallow} from "zustand/react/shallow";
import {TokenInterface} from "@types";

export const tokens: TokenInterface[] = [
    { symbol: "SOL", name: "Solana", icon: "/images/sol.png", chain: "Solana" },
    { symbol: "USDT", name: "USDT", icon: "/images/usdt.png", chain: "Solana" },
    { symbol: "BTC", name: "Bitcoin", icon: "/images/btc.png", chain: "Bitcoin" },
    { symbol: "USDC", name: "USDC", icon: "/images/usdc.png", chain: "Base" },
    { symbol: "BONK", name: "Bonk", icon: "/images/bonk.png", chain: "Base" },
]



interface TokenDropdownProps {
    // selectedTokens: string[]
    // setSelectedTokens?: (val:string[]) => void
    // onSelect: (symbols: string[]) => void
}

export const TokenDropdown: React.FC<TokenDropdownProps> = () => {
    const [search, setSearch] = useState("")
    const [selectedTokens, setSelectedTokens, setSelectedToken, setCurrentState] = userProfileStore(
        useShallow((s) => [s.selectedTokens, s.setSelectedTokens, s.setSelectedToken,s.setCurrentState])
    )

    const filteredTokens = tokens.filter(
        (t) =>
            t.symbol.toLowerCase().includes(search.toLowerCase()) ||
            t.name.toLowerCase().includes(search.toLowerCase())
    )

    const handleSelect = (symbol: string) => {
        const updated = [...selectedTokens, symbol] // ✅ allow duplicates
        setSelectedTokens?.(updated)
        // onSelect(updated)
        setCurrentState?.("1")
        setSearch("")
    }

    const handleRemove = (index: number) => {
        const updated = selectedTokens?.filter((_, i) => i !== index) // remove by index
        if (updated && updated.length >0 ) {
            setSelectedTokens?.(updated)
            // onSelect(updated)
        }
    }

    return (
        <div className="absolute flex flex-col gap-2.5 p-3  mt-2 w-[343px] md:w-[530px]  max-h-[800px] bg-[#2E334D] rounded-2xl overflow-hidden">
                    <p className="text-[22px] flex items-center gap-8 font-bold text-white">
                        <span className={"cursor-pointer"} onClick={() => setCurrentState?.("1")}>
                          <ArrowLeftIcon />
                        </span>{" "}
                        Select a token
                    </p>

                    {/* Search */}
                    <div>
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search by name or CA"
                            className="w-full px-4 py-3 text-sm rounded-lg bg-[#383D56] text-white placeholder-[#A6A0BB] outline-none"
                        />
                    </div>

                    {/* ✅ Selected tokens as pills (duplicates allowed) */}
                    {selectedTokens && selectedTokens.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-2">
                            {selectedTokens?.map((s, idx) => {
                                const token = tokens.find((t) => t.symbol === s)
                                return (
                                    <span
                                        key={idx} // use index, not symbol (to allow duplicates)
                                        className="flex items-center gap-1 bg-[#383D56] text-white text-sm px-2 py-1 rounded-lg"
                                    >
                                        {token?.symbol}
                                        <button
                                            className="ml-1 text-[#A6A0BB] hover:text-white"
                                            onClick={() => handleRemove(idx)}
                                        >
                                            ✕
                                        </button>
                                    </span>
                                )
                            })}
                        </div>
                    )}

                    {/* Token List */}
                    <div className="max-h-[340px] flex flex-col gap-2 overflow-y-auto thin-scrollbar">
                        {filteredTokens.map((token) => (
                            <button
                                key={token.symbol}
                                onClick={() => {
                                    handleSelect(token.symbol)
                                    setSelectedToken(token)
                                }}
                                className="flex items-center gap-3 w-full p-3 bg-[#444A66] rounded-[16px] text-left"
                            >
                                <Image src={token.icon} alt={token.name} width={28} height={28} />
                                <div className="flex flex-col">
                                    <div className="flex gap-2">
                                        <span className="text-white text-[16px] font-bold">{token.symbol}</span>
                                        <span className="bg-[#383D56] rounded-[4px] px-1 uppercase text-[#A6A0BB] text-[12px] font-normal flex items-center">
                                            {token.chain}
                                        </span>
                                    </div>
                                    <span className="text-[14px] font-normal text-[#A6A0BB]">{token.name}</span>
                                </div>
                                <span className="ml-auto ">
                                    <StarIcon />
                                </span>
                            </button>
                        ))}

                        {filteredTokens.length === 0 && (
                            <div className="px-4 py-6 text-center text-gray-400 text-sm">No tokens found</div>
                        )}
                    </div>
                </div>
    )
}
