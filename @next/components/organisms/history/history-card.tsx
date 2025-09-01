"use client"

import {HistoryCard} from "../../molecules/history-card";

const dummyHistory = [
    {
        id: 1,
        from: { amount: 0.21321, symbol: "SOL", icon: "/solana.svg" },
        to: { amount: 0.012373, symbol: "ETH", icon: "/ethereum.svg" },
        priceValue: "21.7632 SOL",
        explorerHref: "https://solscan.io/tx/abc",
        timestamp: new Date("2025-08-21T22:12:00"),
    },
    {
        id: 2,
        from: { amount: 120, symbol: "USDT", icon: "/usdt.svg" },
        to: { amount: 0.99, symbol: "ETH", icon: "/ethereum.svg" },
        priceValue: "119.9 USDT",
        explorerHref: "https://solscan.io/tx/def",
        timestamp: new Date("2025-08-22T18:45:00"),
    },
    {
        id: 3,
        from: { amount: 50, symbol: "SOL", icon: "/solana.svg" },
        to: { amount: 20, symbol: "USDC", icon: "/usdc.svg" },
        priceValue: "49.8 SOL",
        explorerHref: "https://solscan.io/tx/ghi",
        timestamp: new Date("2025-08-23T09:30:00"),
    },
];

export const HistoryCardView = () => {
    return (
        <div className="
          grid gap-4
          grid-cols-1
          sm:grid-cols-2
          auto-rows-fr
        ">
            {dummyHistory.map((swap) => (
                <HistoryCard
                    key={swap.id}
                    from={swap.from}
                    to={swap.to}
                    priceValue={swap.priceValue}
                    explorerHref={swap.explorerHref}
                    timestamp={swap.timestamp}
                />
            ))}
        </div>
    );
};
