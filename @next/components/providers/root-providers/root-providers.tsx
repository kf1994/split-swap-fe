"use client"

import "@solana/wallet-adapter-react-ui/styles.css"
import React from "react"
import type { PropsWithChildren } from "react"
import { ConnectionProvider, WalletProvider } from "@solana/wallet-adapter-react"
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui"
import { PhantomWalletAdapter, SolflareWalletAdapter } from "@solana/wallet-adapter-wallets"
import {ThemeProvider} from "next-themes";
import {SOLANA_RPC} from "@config";
import {OkxWalletAdapter} from "../../wallet-adapters/OkxCustomAdapter";
import { TooltipProvider } from "@api/components/ui/tooltip";


export const RootProviders: React.FC<PropsWithChildren> = ({ children }) => {
    const endpoint = SOLANA_RPC
    const wallets = [new PhantomWalletAdapter(), new SolflareWalletAdapter(), new OkxWalletAdapter()]



    return (
        <ConnectionProvider endpoint={endpoint}>
            <WalletProvider autoConnect wallets={wallets}>
                <WalletModalProvider>
                    <ThemeProvider
                    attribute="class"
                    defaultTheme="light"
                    enableSystem
                    disableTransitionOnChange
                    >
                        <TooltipProvider>
                            {children}
                        </TooltipProvider>
                    </ThemeProvider>
                </WalletModalProvider>
            </WalletProvider>
        </ConnectionProvider>
    )
}
