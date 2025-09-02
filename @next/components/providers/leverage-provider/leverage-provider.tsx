// "use client"
//
// import { PROGRAM_IDS, SOLANA_RPC, SOLANA_RPC_FALLBACK } from "@config"
// import { AnchorProvider } from "@coral-xyz/anchor"
// import { LavarageService, LavarageV2Service } from "@services"
// import { PublicKey } from "@solana/web3.js"
// import { userProfileStore } from "@store"
// import React, { createContext, useContext, useMemo } from "react"
// import FallbackConnection from "solana-fallback-connection"
// import { useShallow } from "zustand/react/shallow"
//
// type LavarageContextType = [LavarageService, LavarageV2Service]
// const publicKeysFromProgramIds = PROGRAM_IDS.map((id) => new PublicKey(id))
//
// const LavarageContext = createContext<LavarageContextType | undefined>(undefined)
//
// const LeverageProvider = ({ children }: { children: React.ReactNode }) => {
//   const [isAuthenticated, selectedWallet, connectedWallet, ] = userProfileStore(
//     useShallow((s) => [s.isAuthenticated, s.wall])
//   )
//
//   const connection = useMemo(() => new FallbackConnection([SOLANA_RPC, SOLANA_RPC_FALLBACK]), [])
//
//   const wallet: any = useMemo(() => {
//     if (selectedWallet) {
//       const maxSpeedWallet = userInfo?.childWallets?.find((wallet) => wallet?.address === selectedWallet?.address)
//       return { ...maxSpeedWallet, publicKey: maxSpeedWallet?.address ? new PublicKey(maxSpeedWallet?.address) : null }
//     }
//     return { ...connectedWallet, publicKey: connectedWallet?.address ? new PublicKey(connectedWallet?.address) : null }
//   }, [ connectedWallet, selectedWallet])
//
//   const lavarages = useMemo(
//     () =>
//       [
//         new LavarageService(
//           new AnchorProvider(connection, wallet as any, AnchorProvider.defaultOptions()),
//           publicKeysFromProgramIds[0]
//         ),
//         new LavarageV2Service(
//           new AnchorProvider(connection, wallet as any, AnchorProvider.defaultOptions()),
//           publicKeysFromProgramIds[1]
//         )
//       ] as LavarageContextType,
//     [wallet?.address, connection, isAuthenticated]
//   )
//
//   return <LavarageContext.Provider value={lavarages}>{children}</LavarageContext.Provider>
// }
//
// const useLavarage = () => {
//   const context = useContext(LavarageContext)
//   if (context === undefined) {
//     throw new Error("useLavarage must be used within a LavarageProvider")
//   }
//   return context
// }
//
// export { LeverageProvider, useLavarage }
