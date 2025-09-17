"use client"

import { BaseService } from "@services"

import axios from "axios"
import Cookies from "js-cookie"
import { API_HOST } from "@config"
import { TokenInfo } from "@types"

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
function createAxiosHeaders(cache = true) {
  const headers = new axios.AxiosHeaders()
  if (!cache) {
    headers.set("Cache-Control", "no-cache")
  }
  return headers
}

export class TokenService extends BaseService {
  async searchToken({ query }: { query: string }) {
    const url = `${API_HOST}/tokens/search?query=${query}`
    const response = await this.http<{ data: TokenInfo[] }>(url)
    return response?.data?.data
  }

  async fetchDexscreenerTokens({
    cache = true,
    signal,
    fetchAll = false
  }: {
    cache?: boolean
    signal?: AbortSignal
    fetchAll?: boolean
  }) {
    const url = `${process.env.NEXT_PUBLIC_SPOT_API}/dexscreener/organic-tokens`

    const token = Cookies.get("authToken")

    const headers = {
      ...createAxiosHeaders(cache),
      "x-api-key": "spotmarketZh0yMrUSpSjz28Id3iIJ7AECB",
      ...(token && { Authorization: `Bearer ${token}` }) // <- add token if available
    }

    const response = await this.http.get<{ data: any }>(url, {
      headers,
      signal
    })

    return response?.data?.data ?? []
  }
}

export const tokenService = new TokenService()
