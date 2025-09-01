"use client"
import * as React from "react";
import {TokenInfo} from "@atoms";
import { ExternalLink } from "lucide-react"
import { SwapArrowsIcon} from "@svgs";

export type SwapToken = {
    amount: number | string;
    symbol: string;
    icon?: string;
};

export interface CustomSwapCardProps {
    from: SwapToken;
    to: SwapToken;
    timestamp?: Date | string | number;
    priceValue?: string | number;
    explorerHref?: string;
    className?: string;
}

export const HistoryCard: React.FC<CustomSwapCardProps> = ({
   from,
   to,
   timestamp,
   priceValue,
   explorerHref,
   className = "",
}) => {
    const formatDate = (input?: Date | string | number) => {
        if (!input) return "";
        const d = input instanceof Date ? input : new Date(input);
        const h = d.getHours().toString().padStart(2, "0");
        const m = d.getMinutes().toString().padStart(2, "0");
        const dd = d.getDate().toString().padStart(2, "0");
        const mm = (d.getMonth() + 1).toString().padStart(2, "0");
        const yyyy = d.getFullYear();
        return `${h}:${m}, ${dd}.${mm}.${yyyy}`;
    };

    return (
        <div
            className={`w-full max-w-[375px] rounded-2xl bg-[#383D56] p-4 text-white  ${className}`}
        >
            {/* Swap section */}
            <div className="flex items-center gap-2 justify-start">
                <TokenInfo token={from} />
                <SwapArrowsIcon />
                <TokenInfo token={to} />
            </div>

            <div className="mt-3 flex flex-col gap-3 space-y-2 text-sm">
                <div className="flex justify-between">
                    <span className="text-[14px] text-white font-normal">Date</span>
                    <span className="text-[14px] text-white font-normal">{formatDate(timestamp)}</span>
                </div>
                <div className="flex justify-between">
                    <span className="text-[14px] text-white font-normal">Price</span>
                    <span className="text-[14px] text-white font-normal">{priceValue}</span>
                </div>
            </div>

            {explorerHref && (
                <a
                    href={explorerHref}
                    target="_blank"
                    className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-[#B8A6FF] hover:underline"
                >
                    <ExternalLink className={"text-[#A7A2FF]"}/> <p className={"text-[#A7A2FF] text-[14px] font-normal"}>View on Solscan</p>
                </a>
            )}
        </div>
    );
};
