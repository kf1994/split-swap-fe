"use client"

import * as React from "react";
import {SwapToken} from "../../molecules/history-card";

export const TokenInfo: React.FC<{ token: SwapToken }> = ({ token }) => (
    <div className="flex items-center gap-2 text-sm">
        {token.icon && (
            <img
                src={token.icon}
                alt={token.symbol}
                className="h-5 w-5 rounded-full"
            />
        )}
        <span className="text-[14px] font-normal">{token.amount}</span>
        <span className="text-[14px] font-normal">{token.symbol}</span>
    </div>
)
