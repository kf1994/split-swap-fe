// "use client"
//
// import { useLavarage } from "@providers"
// import { formatLamportsToSol } from "@utils"
// import { PublicKey } from "@solana/web3.js"
// import { useCallback, useEffect, useState } from "react"
// import {  type TokenInfo } from "@types"
// import { SOL_ADDRESS } from "@config"
// import { userProfileStore } from "@store"
// import { useShallow } from "zustand/react/shallow"
//
// type Balance = {
//     availableSol: number | null
//     connected: boolean
//     publicKey: PublicKey | null
//     refetch: () => void
// }
//
// const activeSubscriptions: Record<string, number> = {}
// const balanceCache: Record<string, number | null> = {}
// export function useTokenBalance(token: TokenInfo): Balance {
//     const lavarages = useLavarage()
//     const lavarage = lavarages[0]
//     const [availableBalance, setAvailableBalance] = useState<number | null>(null)
//
//     const [isAuthenticated, selectedWallet] = userProfileStore(
//         useShallow((s) => [s.isAuthenticated, s.selectedToken, ])
//     )
//
//     const publicKey = mainWallet?.address as string
//     const walletAddress =
//         walletType === WalletType.MAX_SPEED && selectedWallet
//             ? new PublicKey(selectedWallet?.address)
//             : publicKey
//                 ? new PublicKey(publicKey)
//                 : null
//     const updateBalance = (value: number | null) => {
//         balanceCache[token.address] = value
//         setAvailableBalance(value)
//     }
//
//     const fetchBalance = useCallback(() => {
//         if (!lavarages || !walletAddress || !isAuthenticated) {
//             setAvailableBalance(null)
//             return
//         }
//
//         const { connection } = lavarage.program.provider
//
//         const setTokenBalance = () => {
//             connection
//                 .getTokenAccountsByOwner(walletAddress, { mint: new PublicKey(token?.address) }, "confirmed")
//                 .then((res) => {
//                     if (res.value.length === 0) {
//                         updateBalance(null)
//                         return
//                     }
//                     connection
//                         .getTokenAccountBalance(res.value[0].pubkey, "confirmed")
//                         .then((res) => {
//                             updateBalance(res.value.uiAmount)
//                         })
//                         .catch((error) => {
//                             console.error("Error fetching token balance:", error)
//                             updateBalance(null)
//                         })
//                 })
//                 .catch((error) => {
//                     console.error("Error fetching token accounts:", error)
//                     updateBalance(null)
//                 })
//         }
//
//         if (token?.address === SOL_ADDRESS) {
//             connection
//                 .getBalance(walletAddress, "confirmed")
//                 .then((res) => updateBalance(formatLamportsToSol(res).toNumber()))
//                 .catch((error) => {
//                     console.error("Error fetching SOL balance:", error)
//                     updateBalance(null)
//                 })
//         } else {
//             setTokenBalance()
//         }
//     }, [walletAddress?.toString(), isAuthenticated, token?.address])
//
//     useEffect(() => {
//         const cached = balanceCache[token.address]
//         if (cached !== undefined) {
//             setAvailableBalance(cached)
//         }
//         fetchBalance()
//
//         const { connection } = lavarage.program.provider
//         const pubKeyString = walletAddress?.toString()
//         if (!walletAddress || !pubKeyString) return
//
//         if (activeSubscriptions[pubKeyString]) return
//
//         const subscriptionId = connection.onAccountChange(
//             walletAddress,
//             (info) => {
//                 if (token?.address === SOL_ADDRESS) {
//                     if (!info.lamports) return
//                     setAvailableBalance(formatLamportsToSol(info.lamports).toNumber())
//                 } else {
//                     fetchBalance()
//                 }
//             },
//             "confirmed"
//         )
//
//         activeSubscriptions[pubKeyString] = subscriptionId
//
//         return () => {
//             if (activeSubscriptions[pubKeyString]) {
//                 connection.removeAccountChangeListener(activeSubscriptions[pubKeyString])
//                 delete activeSubscriptions[pubKeyString]
//             }
//         }
//     }, [isAuthenticated, token?.address, walletAddress?.toString()])
//
//     return {
//         availableSol: availableBalance,
//         connected: isAuthenticated,
//         publicKey: publicKey ? new PublicKey(publicKey) : null,
//         refetch: fetchBalance
//     }
// }
