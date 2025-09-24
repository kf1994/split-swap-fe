"use client"

import { BaseService } from "@services"

import { API_HOST } from "@config"
import { type TokenInfoInterface } from "@types"

export class TokenService extends BaseService {
  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  async searchToken({ query }: { query?: string }) {
    let url = `${API_HOST}/trade-buffer/search`
    if (query) {
      url += `?query=${query}`
    }
    const response = await this.http<{ data: TokenInfoInterface[] }>(url)
    return response?.data?.data
  }
}

export const tokenService = new TokenService()
