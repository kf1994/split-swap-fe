"use client"

import { MAGIC_BLOCK_RPC, SOLANA_RPC, SOLANA_RPC_FALLBACK } from "@config"
import { AnchorProvider } from "@coral-xyz/anchor"
import { PSService } from "@services"
import { useWallet } from "@solana/wallet-adapter-react"
import type React from "react"
import {
  type PropsWithChildren,
  createContext,
  useContext,
  useMemo
} from "react"
import FallbackConnection from "solana-fallback-connection"

type PrivateSwapContextType = PSService

const PrivateSwapContext = createContext<PrivateSwapContextType | undefined>(
  undefined
)

const PSProvider: React.FC<PropsWithChildren> = ({ children }) => {
  const wallet: any = useWallet()

  const connection = useMemo(
    () => new FallbackConnection([SOLANA_RPC, SOLANA_RPC_FALLBACK]),
    []
  )

  const magicblockConnection = useMemo(
    () => new FallbackConnection([MAGIC_BLOCK_RPC]),
    []
  )

  const privateSwap = useMemo(
    () =>
      new PSService(
        new AnchorProvider(connection, wallet, AnchorProvider.defaultOptions()),
        new AnchorProvider(
          magicblockConnection,
          wallet,
          AnchorProvider.defaultOptions()
        )
      ),
    [wallet.publicKey, connection]
  )

  return (
    <PrivateSwapContext.Provider value={privateSwap}>
      {children}
    </PrivateSwapContext.Provider>
  )
}

const usePrivateSwap = (): PSService => {
  const context = useContext(PrivateSwapContext)
  if (context === undefined) {
    throw new Error("usePrivateSwap must be used within a PSProvider")
  }
  return context
}

export { PSProvider, usePrivateSwap }
