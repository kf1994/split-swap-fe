"use client"

import { useEffect, useState, useCallback } from "react"
import { Connection, PublicKey, LAMPORTS_PER_SOL } from "@solana/web3.js"
import {SOL_ADDRESS, SOLANA_RPC} from "@config"


type BalanceResult = {
    balance?: number
    loading: boolean
    error: string | null
    refetch: () => void
}

export function useTokenBalance(walletAddress: string | undefined, tokenAddress: string): BalanceResult {
    const [balance, setBalance] = useState<number | undefined>(undefined)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const connection = new Connection(SOLANA_RPC)

    const fetchBalance = useCallback(async () => {
        if (!walletAddress) {
            setBalance(null)
            return
        }

        try {
            setLoading(true)
            setError(null)

            const publicKey = new PublicKey(walletAddress)

            // --- If token is SOL ---
            if (tokenAddress === SOL_ADDRESS) {
                const lamports = await connection.getBalance(publicKey, "confirmed")
                setBalance(lamports / LAMPORTS_PER_SOL)
            } else {
                // --- If token is SPL ---
                const mintKey = new PublicKey(tokenAddress)
                const tokenAccounts = await connection.getParsedTokenAccountsByOwner(publicKey, {
                    mint: mintKey,
                })

                if (tokenAccounts.value.length > 0) {
                    const accountInfo = tokenAccounts.value[0].account.data.parsed.info
                    const amount = accountInfo.tokenAmount.uiAmount || 0
                    setBalance(amount)
                } else {
                    setBalance(0)
                }
            }
        } catch (err: any) {
            setError(err.message)
            setBalance(undefined)
        } finally {
            setLoading(false)
        }
    }, [walletAddress, tokenAddress])

    useEffect(() => {
        fetchBalance()
    }, [fetchBalance])

    return { balance, loading, error, refetch: fetchBalance }
}
