"use client"

import {HistoryCard} from "../../molecules/history-card";

export const HistoryCardView = () => {

    return (
        <HistoryCard
            from={{ amount: 0.21321, symbol: "SOL", icon: "/solana.svg" }}
            to={{ amount: 0.012373, symbol: "ETH", icon: "/ethereum.svg" }}
            priceValue="21.7632 SOL"
            explorerHref="https://solscan.io/tx/abc"
        />
    )
}

