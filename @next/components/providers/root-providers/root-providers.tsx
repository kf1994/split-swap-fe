"use client"

import "@solana/wallet-adapter-react-ui/styles.css"
import React from "react"
import type { PropsWithChildren } from "react"
import {
  ConnectionProvider,
  WalletProvider
} from "@solana/wallet-adapter-react"
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui"
import {
  PhantomWalletAdapter,
  SolflareWalletAdapter
} from "@solana/wallet-adapter-wallets"
import { ThemeProvider } from "next-themes"
import { SOLANA_RPC } from "@config"
import { OkxWalletAdapter } from "../../wallet-adapters/OkxCustomAdapter"
import { TooltipProvider } from "@api/components/ui/tooltip"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { PSProvider } from "../../../providers"

const queryClient = new QueryClient()

export const RootProviders: React.FC<PropsWithChildren> = ({ children }) => {
  const endpoint = SOLANA_RPC
  const wallets = [
    new PhantomWalletAdapter(),
    new SolflareWalletAdapter(),
    new OkxWalletAdapter()
  ]

  const [isClient, setIsClient] = React.useState(false)
  React.useEffect(() => {
    setIsClient(true)
  }, [])

  if (!isClient) return null

  return (
    <QueryClientProvider client={queryClient}>
      {/* <LeverageProvider> */}
      <ConnectionProvider endpoint={endpoint}>
        <WalletProvider autoConnect wallets={wallets}>
          <WalletModalProvider>
            <PSProvider>
              <ThemeProvider
                attribute="class"
                defaultTheme="light"
                enableSystem
                disableTransitionOnChange
              >
                <TooltipProvider>{children}</TooltipProvider>
              </ThemeProvider>
            </PSProvider>
          </WalletModalProvider>
        </WalletProvider>
      </ConnectionProvider>
      {/* </LeverageProvider> */}
    </QueryClientProvider>
  )
}
