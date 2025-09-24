"use client"

import { useEffect, useRef, useState } from "react"

export function useUsdPrice(
  symbol?: string,
  address?: string,
  chain: "solana" | "" = "solana"
) {
  const [price, setPrice] = useState<number | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const timerRef = useRef<number | null>(null)

  // Optional Birdeye (set NEXT_PUBLIC_BIRDEYE_KEY)
  const birdeyeKey =
    (typeof process !== "undefined" && process.env?.NEXT_PUBLIC_BIRDEYE_KEY) ??
    undefined

  const fetchJupiter = async () => {
    if (!address || chain !== "solana") return null
    try {
      const url = `https://lite-api.jup.ag/price/v2?ids=${address}`
      const res = await fetch(url, { cache: "no-store" })
      if (!res.ok) return null
      const json = await res.json()
      const p = json?.data?.[address]?.price
      const n = p != null ? Number(p) : null
      return Number.isFinite(n as number) ? (n as number) : null
    } catch {
      return null
    }
  }

  const fetchDexScreener = async () => {
    if (!address || chain !== "solana") return null
    try {
      const url = `https://api.dexscreener.com/tokens/v1/solana/${address}`
      const res = await fetch(url, { cache: "no-store" })
      if (!res.ok) return null
      const json = await res.json()
      const entry = Array.isArray(json) ? json[0] : undefined
      const p = entry?.priceUsd ? Number(entry.priceUsd) : null
      return Number.isFinite(p as number) ? (p as number) : null
    } catch {
      return null
    }
  }

  const fetchCoinGecko = async () => {
    if (!address || !chain) return null
    try {
      const platform = chain // "solana"
      const url = `https://api.coingecko.com/api/v3/simple/token_price/${platform}?contract_addresses=${address}&vs_currencies=usd`
      const res = await fetch(url, { cache: "no-store" })
      if (!res.ok) return null
      const json = await res.json()
      const key = Object.keys(json)[0]
      const p = key ? Number(json[key]?.usd) : null
      return Number.isFinite(p as number) ? (p as number) : null
    } catch {
      return null
    }
  }

  const fetchBirdeye = async () => {
    if (!birdeyeKey || !address || chain !== "solana") return null
    try {
      const url = `https://public-api.birdeye.so/public/price?address=${address}`
      const res = await fetch(url, {
        cache: "no-store",
        headers: { "X-API-KEY": birdeyeKey }
      })
      if (!res.ok) return null
      const json = await res.json()
      const p = json?.data?.value ? Number(json.data.value) : null
      return Number.isFinite(p as number) ? (p as number) : null
    } catch {
      return null
    }
  }

  const fetchCoinbase = async () => {
    if (!symbol || symbol === "?") return null
    try {
      const url = `https://api.coinbase.com/v2/exchange-rates?currency=${encodeURIComponent(
        symbol
      )}`
      const res = await fetch(url, { cache: "no-store" })
      if (!res.ok) return null
      const json = await res.json()
      const rateStr = json?.data?.rates?.USD as string | undefined
      const val = rateStr ? Number(rateStr) : null
      return Number.isFinite(val as number) ? (val as number) : null
    } catch {
      return null
    }
  }

  const load = async () => {
    setLoading(true)
    setError(null)
    try {
      const order = [
        fetchJupiter,
        fetchDexScreener,
        fetchBirdeye,
        fetchCoinGecko,
        fetchCoinbase
      ]
      for (const fn of order) {
        const p = await fn()
        if (p != null) {
          setPrice(p)
          return
        }
      }
      setError("No USD price found for this token (need a known mint)")
      setPrice(null)
    } catch (e: any) {
      setError(e?.message || "Failed to load price")
      setPrice(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void load()
    // auto-refresh every 30s
    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    timerRef.current = window.setInterval(load, 30_000)
    return () => {
      if (timerRef.current) window.clearInterval(timerRef.current)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [symbol, address, chain, birdeyeKey])

  return { price, loading, error, refresh: load } as const
}

export const formatUSD = (n: number | null | undefined) => {
  if (n == null) return "—"
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 6,
    currencyDisplay: "narrowSymbol"
  }).format(n)
}
