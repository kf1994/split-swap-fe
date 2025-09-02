import { PublicKey } from "@solana/web3.js"
import type BigNumber from "bignumber.js"
import { BaseService } from "./base-service"
import { USDC_ADDRESS } from "@config"
import { IPriceResponse } from "@types"
import { formatSolToLamports } from "@utils"
import { PROGRAM_ID as JUP_REFERRAL_PROGRAM_ID } from "@jup-ag/referral-sdk"

const JUP_REFERRAL_KEY = process.env.NEXT_PUBLIC_JUP_REFERRAL_KEY ?? ""
const JUP_SWAP_REFERRAL_KEY = process.env.NEXT_PUBLIC_JUP_SWAP_REFERRAL_KEY ?? ""

export class JupiterSource extends BaseService {
  readonly urls = {
    swapQuote: (
      from: string,
      to: string,
      amount: string,
      slippage: number,
      jupiterPlatformFeeBps: number,
      maxAccounts = "26"
    ) => {
      if (from === "pumpCmXqMfrsAkQ5r49WcJnRayYRqmXz6ae8H7H9Dfn" || to === "pumpCmXqMfrsAkQ5r49WcJnRayYRqmXz6ae8H7H9Dfn") {
        maxAccounts = "20"
      } else if (
        from === "FTggXu7nYowpXjScSw7BZjtZDXywLNjK88CGhydDGgMS" ||
        to === "FTggXu7nYowpXjScSw7BZjtZDXywLNjK88CGhydDGgMS"
      ) {
        maxAccounts = "64"
      }
      return `https://quote-api.jup.ag/v6/quote?inputMint=${from}&outputMint=${to}&amount=${amount}&slippageBps=${Math.floor(
        slippage
      )}&swapMode=ExactIn&onlyDirectRoutes=false&asLegacyTransaction=false&maxAccounts=${maxAccounts}&minimizeSlippage=false&swapType=aggregator&tokenCategoryBasedIntermediateTokens=true&platformFeeBps=${jupiterPlatformFeeBps}`
    },
    swap: "https://quote-api.jup.ag/v6/swap",
    swapIx: "https://quote-api.jup.ag/v6/swap-instructions"
  } as const
  readonly fallbackUrls = {
    swapQuote: (from: string, to: string, amount: string, slippage: number, jupiterPlatformFeeBps: number) =>
      `https://quote-api.jup.ag/v6/quote?inputMint=${from}&outputMint=${to}&amount=${amount}&slippageBps=${Math.floor(
        slippage
      )}&swapMode=ExactIn&onlyDirectRoutes=false&asLegacyTransaction=false&maxAccounts=22&minimizeSlippage=false&swapType=aggregator&tokenCategoryBasedIntermediateTokens=true&platformFeeBps=${jupiterPlatformFeeBps}`,
    swap: "https://quote-api.jup.ag/v6/swap",
    swapIx: "https://quote-api.jup.ag/v6/swap-instructions"
  } as const

  async getPrice(baseCurrencies: string, vsToken = USDC_ADDRESS): Promise<IPriceResponse> {
    const response = await this.http(`https://lite-api.jup.ag/price/v2?ids=${baseCurrencies}&vsToken=${vsToken}`)
    if (response.status < 200 || 300 <= response.status) {
      throw new Error("failed to fetch tokens")
    }
    return response.data
  }

  async getSwapTx(
    from: string,
    to: string,
    amount: number,
    slippage: number,
    userPubKey: string,
    jupiterPlatformFeeBps: number
  ) {
    const quoteResponse = await this.getSwapQuote(from, to, formatSolToLamports(amount), slippage, jupiterPlatformFeeBps)
    try {
      const result = await (
        await this.http.post(this.urls.swap, {
          quoteResponse,
          userPublicKey: new PublicKey(userPubKey),
          wrapAndUnwrapSol: true
        })
      ).data
      return result
    } catch (e) {
      console.log("fallback to jup.ag")
      const result = await (
        await this.http.post(this.fallbackUrls.swap, {
          quoteResponse,
          userPublicKey: new PublicKey(userPubKey),
          wrapAndUnwrapSol: true
        })
      ).data
      return result
    }
  }

  async getSwapIx(
    from: string,
    to: string,
    amount: BigNumber,
    _slippage: number,
    userPubKey: string,
    jupiterPlatformFeeBps: number,
    positionAccountTokenAccountPubKey?: string,
    buy?: boolean,
    swap?: boolean,
    useTokenLedger?: boolean
  ) {
    let slippage = _slippage
    if (useTokenLedger) {
      slippage = 6
      if (from === "8rLcHLi5UARNbWhKh6YNUB7NFuLph8Dv2qWXHxaHoPDq") {
        slippage = 11
      }
    }

    const quoteResponse = await this.getSwapQuote(from, to, amount, slippage, jupiterPlatformFeeBps)

    let feeAccount: PublicKey | undefined = undefined
    if (jupiterPlatformFeeBps && jupiterPlatformFeeBps > 0) {
      const [_feeAccount] = PublicKey.findProgramAddressSync(
        [
          Buffer.from("referral_ata"),
          new PublicKey(swap ? JUP_SWAP_REFERRAL_KEY ?? JUP_REFERRAL_KEY : JUP_REFERRAL_KEY).toBuffer(),

          new PublicKey(buy ? to : from).toBuffer()
        ],
        new PublicKey(JUP_REFERRAL_PROGRAM_ID)
      )

      feeAccount = _feeAccount
    }

    try {
      const instructions = await (
        await this.http.post(this.urls.swapIx, {
          quoteResponse,
          userPublicKey: userPubKey,
          // only when SOL is a base currency
          wrapAndUnwrapSol: swap
            ? true
            : (from === "So11111111111111111111111111111111111111112" && buy) ||
              (to === "So11111111111111111111111111111111111111112" && !buy),
          destinationTokenAccount: positionAccountTokenAccountPubKey,
          useTokenLedger,
          feeAccount
        })
      ).data

      return { instructions, quoteResponse }
    } catch (e) {
      console.log("fallback to jup.ag")
      const instructions = await (
        await this.http.post(this.fallbackUrls.swapIx, {
          quoteResponse,
          userPublicKey: userPubKey,
          wrapAndUnwrapSol: true,
          destinationTokenAccount: positionAccountTokenAccountPubKey,
          useTokenLedger,
          feeAccount
        })
      ).data

      return { instructions, quoteResponse }
    }
  }
  private async getSwapQuote(from: string, to: string, amount: BigNumber, slippage: number, jupiterPlatformFeeBps: number) {
    const amountInLamports = amount.toString().split(".")[0]
    try {
      const response = await this.http.get(
        this.urls.swapQuote(from, to, amountInLamports, slippage * 100, jupiterPlatformFeeBps)
      )

      return response.data
    } catch (e: any) {
      console.log("fallback to jup.ag", e)
      if (e?.response?.data?.errorCode === "COULD_NOT_FIND_ANY_ROUTE") {
        const response = await this.http.get(
          this.urls.swapQuote(from, to, amountInLamports, slippage * 100, jupiterPlatformFeeBps, "64")
        )

        return response.data
      }
      const response = await this.http.get(
        this.fallbackUrls.swapQuote(from, to, amountInLamports, slippage * 100, jupiterPlatformFeeBps)
      )

      return response.data
    }
  }
}

export const jupiterSource = new JupiterSource()
