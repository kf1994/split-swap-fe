"use client"

import { useEffect, useMemo, useRef, useState, useCallback } from "react"
import { Connection, PublicKey, LAMPORTS_PER_SOL } from "@solana/web3.js"
import { SOL_ADDRESS, SOLANA_RPC } from "@config"

interface BalanceResult {
  balance: number | null
  loading: boolean
  error: string | null
  refetch: () => void
}

const activeSubscriptions: Record<string, number> = {}
// key: `${walletKey}:${tokenAddress}` => value
const balanceCache: Record<string, number | null> = {}

export function useTokenBalance(
  walletAddress: string | undefined | null,
  tokenAddress: string
): BalanceResult {
  const [balance, setBalance] = useState<number | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const connection = useMemo(() => new Connection(SOLANA_RPC), [])
  const prevWalletKeyRef = useRef<string | null>(null)

  const walletKey = useMemo(() => {
    if (!walletAddress) return null
    try {
      return new PublicKey(walletAddress).toBase58()
    } catch {
      return null
    }
  }, [walletAddress])

  const cacheKey = walletKey ? `${walletKey}:${tokenAddress}` : null

  const updateBalance = useCallback(
    (value: number | null) => {
      if (cacheKey) balanceCache[cacheKey] = value
      setBalance(value)
    },
    [cacheKey]
  )

  const fetchBalance = useCallback(async () => {
    if (!walletKey) {
      // disconnected — clear local state (and do not persist under undefined key)
      setError(null)
      setBalance(null)
      return
    }

    setLoading(true)
    setError(null)
    try {
      const ownerPk = new PublicKey(walletKey)

      if (tokenAddress === SOL_ADDRESS) {
        const lamports = await connection.getBalance(ownerPk, "confirmed")
        updateBalance(lamports / LAMPORTS_PER_SOL)
        return
      }

      // SPL token
      const mintKey = new PublicKey(tokenAddress)
      const { value } = await connection.getParsedTokenAccountsByOwner(
        ownerPk,
        { mint: mintKey },
        "confirmed"
      )

      if (value.length === 0) {
        updateBalance(0)
        return
      }

      const info = (value[0].account.data as any)?.parsed?.info
      const amount = info?.tokenAmount?.uiAmount ?? 0
      updateBalance(amount)
    } catch (e: any) {
      setError(e?.message ?? "Failed to fetch balance")
      // still set something deterministic for UI
      setBalance(null)
    } finally {
      setLoading(false)
    }
  }, [walletKey, tokenAddress, connection, updateBalance])

  // Load from cache (wallet+token) then fetch fresh
  useEffect(() => {
    if (!walletKey) {
      // on disconnect: clear state and also clear any cache tied to previous wallet
      setBalance(null)
      setError(null)
      if (prevWalletKeyRef.current) {
        // optional: wipe all cached balances for previous wallet to avoid stale UI if it reconnects with different tokens
        const prevPrefix = `${prevWalletKeyRef.current}:`
        Object.keys(balanceCache).forEach((k) => {
          if (k.startsWith(prevPrefix)) delete balanceCache[k]
        })
      }
      return
    }

    prevWalletKeyRef.current = walletKey

    const ck = `${walletKey}:${tokenAddress}`
    if (ck in balanceCache) {
      setBalance(balanceCache[ck])
    } else {
      setBalance(null)
    }

    // always fetch fresh when wallet or token changes
    fetchBalance()
  }, [walletKey, tokenAddress, fetchBalance])

  // Listener: subscribe once per wallet to its account; SOL updates inline, SPL triggers a refetch.
  useEffect(() => {
    if (!walletKey) {
      // remove previous wallet subscription if any
      const prev = prevWalletKeyRef.current
      if (prev && activeSubscriptions[prev]) {
        connection.removeAccountChangeListener(activeSubscriptions[prev])
        delete activeSubscriptions[prev]
      }
      return
    }

    // if already subscribed for this wallet, do nothing
    if (!activeSubscriptions[walletKey]) {
      const id = connection.onAccountChange(
        new PublicKey(walletKey),
        (info) => {
          if (tokenAddress === SOL_ADDRESS) {
            if (typeof info.lamports === "number") {
              const sol = info.lamports / LAMPORTS_PER_SOL
              const ck = `${walletKey}:${SOL_ADDRESS}`
              balanceCache[ck] = sol
              // only update state if we're currently looking at SOL for this wallet
              setBalance((prev) => (tokenAddress === SOL_ADDRESS ? sol : prev))
            }
          } else {
            // any owner account change could affect token accounts -> refetch
            fetchBalance()
          }
        },
        "confirmed"
      )
      activeSubscriptions[walletKey] = id
    }

    return () => {
      // on wallet change/unmount, clean up this wallet's subscription
      const id = activeSubscriptions[walletKey]
      if (id) {
        connection.removeAccountChangeListener(id)
        delete activeSubscriptions[walletKey]
      }
    }
  }, [walletKey, tokenAddress, connection, fetchBalance])

  return { balance, loading, error, refetch: fetchBalance }
}
