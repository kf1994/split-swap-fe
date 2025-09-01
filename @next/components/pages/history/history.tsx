"use client"

import * as React from "react";
import {HistoryCardView, TradeHistoryTable, TradeRow} from "@organisms";
import useMediaQuery from "use-media-antd-query";

const demoRows: TradeRow[] = Array.from({ length: 7 }).map((_, i) => ({
    id: String(i + 1),
    date: "22:12, 21.08.2025",
    from: { amount: "0.21321", symbol: "SOL" },
    price: "21.7632 SOL",
    to: { amount: "0.012373", symbol: "ETH" },
    href: "https://example.com/tx/abcdef",
}))

export const HistoryPage = () => {
    const colSize = useMediaQuery()
    const isMbl = ["xs","sm"].includes(colSize)
    return (
        <>
            <div className="min-h-[60vh] pl-[40px] pr-[40px]  w-full">
                <div className="mx-auto flex flex-col gap-3 history-container">
                    <p className={"text-[22px] text-white font-bold"}>History</p>
                    {!isMbl && <TradeHistoryTable rows={demoRows}/> }
                    {isMbl && <HistoryCardView/>}
                </div>
            </div>
        </>
    )
}
