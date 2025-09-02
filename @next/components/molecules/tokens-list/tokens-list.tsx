"use client"

import React, { useEffect, useState } from "react"
import Image from "next/image"
import { ArrowLeftIcon, StarIcon } from "@svgs"
import { userProfileStore } from "@store"
import { useShallow } from "zustand/react/shallow"
import { tokenService } from "@services"
import {TokenInfoInterface} from "@types";

interface TokenDropdownProps {}

type APIToken = Record<string, any>

export const TokensList: React.FC<TokenDropdownProps> = () => {
    const [search, setSearch] = useState("")
    const [results, setResults] = useState<TokenInfoInterface[]>([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const [selectedTokens, setSelectedTokens, setCurrentState, setSwapFrom, setSwapTo, setSendFrom, setSendTo, activeSelector, setActiveSelector] = userProfileStore(
        useShallow((s) => [s.selectedTokens, s.setSelectedTokens, s.setCurrentState, s.setSwapFrom, s.setSwapTo, s.setSendFrom, s.setSendTo,s.activeSelector,s.setActiveSelector])
    )

    const normalize = (t: APIToken) => {
        return {
            key: t.address || t.symbol,
            symbol: t.symbol ?? "?",
            name: t.name ?? t.symbol,
            icon: t.logoURI ,
            chain: t.chain ?? "-",
            __raw: t
        }
    }

    const handleSelectedToken = (rawToken: TokenInfoInterface) => {
        if (!activeSelector) return

        if (activeSelector.section === "swap") {
            activeSelector.side === "from"
                ? setSwapFrom(rawToken)
                : setSwapTo(rawToken)
        } else {
            activeSelector.side === "from"
                ? setSendFrom(rawToken)
                : setSendTo(rawToken)
        }

        setCurrentState("1")
        setActiveSelector(null) // clear context
    }

    const fetchTokens = async (query: string) => {
        try {
            setLoading(true)
            setError(null)
            const data = await tokenService.searchToken({ query })
            setResults(Array.isArray(data) ? data : [])
        } catch (e) {
            setError("Failed to load tokens")
            setResults([])
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        void fetchTokens("sol")
    }, [])

    useEffect(() => {
        if (search.trim().length >= 2) {
            void fetchTokens(search)
        }
    }, [search])

    const handleSelect = (symbol: string, rawToken?: any) => {
        debugger
        const updated = [...(selectedTokens || []), symbol]
        setSelectedTokens?.(updated)
        // setSelectedToken?.(rawToken)
        setSearch("")
        handleSelectedToken(rawToken)
    }

    const handleRemove = (index: number) => {
        const updated = selectedTokens?.filter((_, i) => i !== index)
        if (updated && updated.length > 0) {
            setSelectedTokens?.(updated)
        }
    }

    return (
        <div className="absolute flex flex-col gap-2.5 p-3 mt-2 w-[343px] md:w-[530px] max-h-[800px] bg-[#2E334D] rounded-2xl overflow-hidden">
            <p className="text-[22px] flex items-center gap-8 font-bold text-white">
        <span className="cursor-pointer" onClick={() => setCurrentState?.("1")}>
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
                    placeholder="Search by name, symbol, or CA"
                    className="w-full px-4 py-3 text-sm rounded-lg bg-[#383D56] text-white placeholder-[#A6A0BB] outline-none"
                />
            </div>

            {/* Selected tokens as pills (duplicates allowed) */}
            {selectedTokens && selectedTokens.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                    {selectedTokens?.map((s: string, idx: number) => (
                        <span key={idx} className="flex items-center gap-1 bg-[#383D56] text-white text-sm px-2 py-1 rounded-lg">
              {s}
                            <button className="ml-1 text-[#A6A0BB] hover:text-white" onClick={() => handleRemove(idx)}>
                ✕
              </button>
            </span>
                    ))}
                </div>
            )}

            {/* Token List */}
            <div className="max-h-[340px] flex flex-col gap-2 overflow-y-auto thin-scrollbar">
                {loading && <div className="px-4 py-6 text-center text-[#A6A0BB] text-sm">Searching…</div>}

                {!loading && error && <div className="px-4 py-6 text-center text-red-300 text-sm">{error}</div>}

                {!loading && !error && results.length > 0 && (
                    <>
                        {results.map((t) => {
                            const token = normalize(t)
                            return (
                                <button
                                    key={token.key}
                                    onClick={() => handleSelect(token.symbol, token.__raw)}
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
                                    <span className="ml-auto">
                                        <StarIcon />
                                    </span>
                                </button>
                            )
                        })}
                    </>
                )}

                {!loading && !error && results.length === 0 && search.trim().length >= 2 && (
                    <div className="px-4 py-6 text-center text-gray-400 text-sm">No tokens found</div>
                )}
            </div>
        </div>
    )
}
