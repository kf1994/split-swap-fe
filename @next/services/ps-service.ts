/* eslint-disable curly */
"use client"

import { type AnchorProvider, BN, Program } from "@coral-xyz/anchor"
import { PrivateSwap } from "@idls"
import {
  Connection,
  PublicKey,
  SystemProgram,
  TransactionMessage,
  VersionedTransaction
} from "@solana/web3.js"
import {
  getAssociatedTokenAddressSync,
  TOKEN_2022_PROGRAM_ID,
  TOKEN_PROGRAM_ID
} from "@solana/spl-token"
import { useAlertStore } from "@store"
import { tokenService } from "./token-service"
import BigNumber from "bignumber.js"
import { SOLANA_RPC } from "@config"

export class PSService {
  readonly program: Program<typeof PrivateSwap>
  readonly magicblockProgram: Program<typeof PrivateSwap>
  readonly connection: Connection

  constructor(provider: AnchorProvider, magicblockProvider: AnchorProvider) {
    this.program = new Program(PrivateSwap, provider)
    this.magicblockProgram = new Program(PrivateSwap, magicblockProvider)
    this.connection = new Connection(SOLANA_RPC)
  }

  // Prefer provider.publicKey when available (as in your codebase),
  // otherwise fall back to provider.wallet.publicKey for safety.
  private get userPk(): PublicKey | null {
    const p: any = this.program.provider as any
    return (p.publicKey as PublicKey) ?? p.wallet?.publicKey ?? null
  }

  private get magicUserPk(): PublicKey | null {
    const p: any = this.magicblockProgram.provider as any
    return (p.publicKey as PublicKey) ?? p.wallet?.publicKey ?? null
  }

  private deriveUserBalancePda(user: PublicKey): PublicKey {
    const [pda] = PublicKey.findProgramAddressSync(
      [Buffer.from("user_balance"), user.toBuffer()],
      this.program.programId
    )

    return pda
  }

  async checkUserBalanceAmount(
    tokenMint: string,
    enteredAmount?: BN
  ): Promise<{ isAvailable: boolean; availableAmount: null | BN }> {
    try {
      const user = this.userPk
      if (!user) return { isAvailable: false, availableAmount: null }

      const userBalanceAddress = this.deriveUserBalancePda(user)
      const res = await (
        this.magicblockProgram.account as any
      ).userBalance.fetch(userBalanceAddress)
      console.log(res, "CHECK RESPONSE FROM BALANCE")

      // Convert BN to BigNumber for comparison
      const entered = enteredAmount
        ? new BigNumber(enteredAmount.toString())
        : new BigNumber(0)
      const tokenMintStr = tokenMint

      // Step 1: Find total balance
      const balanceObj = res?.balances?.find(
        (b: any) => b.tokenMint.toString() === tokenMintStr
      )
      const totalBalance = new BigNumber(balanceObj?.amount || "0")

      // Step 2: Sum all pending amounts for that token
      const totalPending =
        res?.pendingTrades
          ?.filter(
            (p: any) =>
              p?.inputTokenMintWithAmount?.tokenMint?.toString() ===
              tokenMintStr
          )
          ?.reduce((sum: BigNumber, p: any) => {
            const amt = new BigNumber(
              p?.inputTokenMintWithAmount?.amount || "0"
            )
            return sum.plus(amt)
          }, new BigNumber(0)) || new BigNumber(0)

      // Step 3: Available = balance - pending
      const available = totalBalance.minus(totalPending)

      console.log(
        {
          entered: entered.toString(),
          totalBalance: totalBalance.toString(),
          totalPending: totalPending.toString(),
          available: available.toString()
        },
        "USER BALANCE DETAILS"
      )
      const val = res?.balances?.map((item: any) => {
        console.log(
          item?.amount?.toString(),
          item?.tokenMint?.toString(),
          "CHECK THE BALANCE HERE"
        )
      })
      const val2 = res?.pendingTrades?.map((item: any) => {
        console.log(
          item?.inputTokenMintWithAmount?.amount?.toString(),
          item?.inputTokenMintWithAmount?.tokenMint?.toString(),
          "CHECK THE PENDING BALANCE"
        )
      })
      let isEnough = false
      // Step 4: Check if available >= entered
      if (entered.gt(0)) {
        isEnough = available.gte(entered)
      }
      if (entered.eq(0)) {
        isEnough = available.gt(0)
      }
      return {
        isAvailable: isEnough,
        availableAmount: new BN(available.toString())
      }
    } catch (err) {
      console.error("Error checking user balance:", err)
      return { isAvailable: false, availableAmount: null }
    }
  }

  async checkUserBalanceExists(): Promise<boolean> {
    const user = this.userPk
    if (!user) return false
    try {
      const [userBalanceAddress] = PublicKey.findProgramAddressSync(
        [Buffer.from("user_balance"), user.toBuffer()],
        this.program.programId
      )

      await (this.program.account as any).userBalance.fetch(userBalanceAddress)
      return true
    } catch (error) {
      return false
    }
  }

  async createUserBalanceState(): Promise<null | {
    signature: string
    userBalance: PublicKey
  }> {
    const user = this.userPk
    if (!user) return null

    const userBalance = this.deriveUserBalancePda(user)

    const signature = await this.program.methods
      .createUserBalanceState()
      .accounts({
        user,
        userBalance,
        systemProgram: SystemProgram.programId,
        ownerProgram: this.program.programId,
        delegationProgram: new PublicKey(
          "DELeGGvXpWV2fqJUhqcF5ZSYMS4JTLjteaAMARRSaeSh"
        )
      })
      .rpc()

    return { signature, userBalance }
  }

  /**
   * Find the first trade buffer index that is *available* according to:
   * - if account exists on Solana and owner === program.programId -> NOT available
   * - if account exists on Solana and owner === delegation program -> check ER:
   *    * if magicblockProgram has the same tradeBuffer account -> AVAILABLE
   *    * else -> NOT available (undelegation)
   * - else -> NOT available
   */
  async getAvailableTradeBufferFrontend(
    maxIndex = 10
  ): Promise<{ address: PublicKey; index: number } | null> {
    for (let i = 10; i < maxIndex; i++) {
      const indexBuf = Buffer.from([i & 0xff])
      console.log(indexBuf?.toString(), "CHECK ON BUFFER")

      const [tradeBufferAddress] = PublicKey.findProgramAddressSync(
        [Buffer.from("trade_buffer"), indexBuf],
        this.program.programId
      )

      try {
        const tradeBuffer = await (
          this.program.account as any
        ).tradeBuffer.fetch(tradeBufferAddress)

        if (!tradeBuffer) return null

        const [delegationRecord] = PublicKey.findProgramAddressSync(
          [Buffer.from("delegation"), tradeBufferAddress.toBuffer()],
          new PublicKey("DELeGGvXpWV2fqJUhqcF5ZSYMS4JTLjteaAMARRSaeSh")
        )

        const info = await this.connection.getAccountInfo(delegationRecord)

        if (info) {
          console.log(
            `✅ Found available trade buffer at index ${i}`,
            tradeBufferAddress.toString()
          )
          return { address: tradeBufferAddress, index: i }
        }
      } catch (err) {
        // Defensive: if something unexpected fails, continue searching other indices
        console.log(`Index ${i}: error while checking:`, err)
        continue
      }
    }

    console.error("No available trade buffer found.")
    return null
  }

  async depositOnL1(
    tokenMint: PublicKey,
    amount: BN,
    nonce: BN
  ): Promise<string | null> {
    const trader = this.magicUserPk
    if (!trader) return null

    const [globalState] = PublicKey.findProgramAddressSync(
      [Buffer.from("global_state")],
      this.program.programId
    )

    const [depositState] = PublicKey.findProgramAddressSync(
      [
        Buffer.from("deposit_state"),
        trader.toBuffer(),
        nonce.toArrayLike(Buffer, "le", 8)
      ],
      this.program.programId
    )

    const userTokenAccount = getAssociatedTokenAddressSync(tokenMint, trader)
    const vaultTokenAccount = getAssociatedTokenAddressSync(
      tokenMint,
      globalState,
      true
    )

    const tx = await this.program.methods
      .depositOnL1(nonce, amount)
      .accounts({
        trader,
        globalState,
        depositState,
        userTokenAccount,
        tokenMint,
        vaultTokenAccount,
        tokenProgram: TOKEN_PROGRAM_ID,
        tokenProgram2022: TOKEN_2022_PROGRAM_ID,
        systemProgram: SystemProgram.programId
      })
      .rpc()

    return tx
  }

  async createTradeBuffer(
    tradeBufferIndex: number
  ): Promise<null | { signature: string; tradeBuffer: PublicKey }> {
    // Optional: bounds check since index is 1 byte
    if (tradeBufferIndex < 0 || tradeBufferIndex > 255) {
      throw new Error("tradeBufferIndex must be in [0, 255] for 1-byte seed")
    }

    const p: any = this.program.provider as any
    const user: PublicKey | null = p.publicKey ?? p.wallet?.publicKey ?? null

    if (!user) return null

    // indexLE (1 byte)
    const indexBuf = Buffer.from([tradeBufferIndex & 0xff])

    // PDA: ["trade_buffer", indexLE]
    const [tradeBuffer] = PublicKey.findProgramAddressSync(
      [Buffer.from("trade_buffer"), indexBuf],
      this.program.programId
    )

    const signature = await this.program.methods
      .createTradeBuffer(tradeBufferIndex)
      .accounts({
        user,
        tradeBuffer,
        systemProgram: SystemProgram.programId,
        ownerProgram: this.program.programId,
        delegationProgram: new PublicKey(
          "DELeGGvXpWV2fqJUhqcF5ZSYMS4JTLjteaAMARRSaeSh"
        )
      })
      .rpc()

    return { signature, tradeBuffer }
  }

  getWithdrawalStateAddress(
    programId: PublicKey,
    withdrawalStateIndex: number
  ): PublicKey {
    const [withdrawalState] = PublicKey.findProgramAddressSync(
      [
        Buffer.from("withdrawal_state"),
        Buffer.from([withdrawalStateIndex & 0xff])
      ],
      programId
    )
    return withdrawalState
  }

  async checkWithdrawalStateReady(
    withdrawalStateIndex: number
  ): Promise<boolean> {
    try {
      const [withdrawalState] = PublicKey.findProgramAddressSync(
        [Buffer.from("withdrawal_state"), Buffer.from([withdrawalStateIndex])],
        this.program.programId
      )

      // Try to fetch the withdrawal state account (on mainnet program)
      await (this.program.account as any).withdrawalState.fetch(withdrawalState)

      // Check delegated record presence on delegation program
      const delegationProgramPk = new PublicKey(
        "DELeGGvXpWV2fqJUhqcF5ZSYMS4JTLjteaAMARRSaeSh"
      )
      const [delegationRecord] = PublicKey.findProgramAddressSync(
        [Buffer.from("delegation"), withdrawalState.toBuffer()],
        delegationProgramPk
      )

      const accountInfo = await this.program.provider.connection.getAccountInfo(
        delegationRecord
      )
      console.log(accountInfo, "CHECK ACCOUNT INFO")

      return !!accountInfo
    } catch (err) {
      // either withdrawalState doesn't exist or delegation missing
      return false
    }
  }

  async createWithdrawalState(
    withdrawalStateIndex: number
  ): Promise<null | { signature: string; withdrawalState: PublicKey }> {
    const user = this.userPk
    if (!user) return null

    const withdrawalState = this.getWithdrawalStateAddress(
      this.program.programId,
      withdrawalStateIndex
    )

    const sig = await this.program.methods
      .delegateWithdrawalState(withdrawalStateIndex)
      .accounts({
        payer: user,
        withdrawalState,
        systemProgram: SystemProgram.programId,
        ownerProgram: this.program.programId,
        delegationProgram: new PublicKey(
          "DELeGGvXpWV2fqJUhqcF5ZSYMS4JTLjteaAMARRSaeSh"
        )
      })
      .rpc()

    return { signature: sig, withdrawalState }
  }

  async getUserTokenBalanceOnEr(tokenMint: PublicKey): Promise<BN> {
    const trader = this.magicUserPk
    if (!trader) return new BN(0)

    try {
      const [userBalanceAddr] = PublicKey.findProgramAddressSync(
        [Buffer.from("user_balance"), trader.toBuffer()],
        this.magicblockProgram.programId
      )

      const res =
        (await (
          this.magicblockProgram.account as any
        ).userBalance.fetchNullable?.(userBalanceAddr)) ??
        (await (this.magicblockProgram.account as any).userBalance
          .fetch(userBalanceAddr)
          .catch(() => null))

      if (!res) return new BN(0)

      const found = res.balances?.find(
        (b: any) => b.tokenMint?.toString() === tokenMint.toString()
      )
      const amt = found?.amount ? new BN(found.amount.toString()) : new BN(0)
      return amt
    } catch (err) {
      console.error("getUserTokenBalanceOnEr error:", err)
      return new BN(0)
    }
  }

  async placeWithdrawal(
    withdrawalStateIndex: number,
    withdrawalTokenMint: PublicKey,
    withdrawalAmount: BN,
    receivers: PublicKey[]
  ): Promise<string | null> {
    const trader = this.magicUserPk
    if (!trader) return null

    if (receivers.length === 0 || receivers.length > 10) {
      throw new Error("Receivers array must have between 1 and 10 addresses")
    }

    const [globalState] = PublicKey.findProgramAddressSync(
      [Buffer.from("global_state")],
      this.magicblockProgram.programId
    )
    const [userBalance] = PublicKey.findProgramAddressSync(
      [Buffer.from("user_balance"), trader.toBuffer()],
      this.magicblockProgram.programId
    )
    const [withdrawalState] = PublicKey.findProgramAddressSync(
      [
        Buffer.from("withdrawal_state"),
        Buffer.from([withdrawalStateIndex & 0xff])
      ],
      this.magicblockProgram.programId
    )
    console.log(
      withdrawalStateIndex,
      withdrawalTokenMint.toString(),
      withdrawalAmount.toString(),
      receivers[0].toString(),
      trader?.toString(),
      userBalance?.toString(),
      globalState.toString(),
      withdrawalState?.toString(),
      "CHECK VALUES ON WITHDRAWL"
    )

    const tx = await this.magicblockProgram.methods
      .placeWithdrawal(
        withdrawalStateIndex,
        withdrawalTokenMint,
        withdrawalAmount,
        receivers
      )
      .accounts({
        trader,
        userBalance,
        globalState,
        withdrawalState
      })
      .rpc()

    return tx
  }

  async placeTrade(
    tradeBuffer: PublicKey,
    tradeBufferIndex: number,
    inputMint: PublicKey,
    outputMint: PublicKey,
    amountIn: BN,
    slippageBps: number
  ): Promise<string | null> {
    const trader = this.magicUserPk
    if (!trader) return null

    const [orderCounter] = PublicKey.findProgramAddressSync(
      [Buffer.from("order_counter")],
      this.magicblockProgram.programId
    )

    const [userBalance] = PublicKey.findProgramAddressSync(
      [Buffer.from("user_balance"), trader.toBuffer()],
      this.magicblockProgram.programId
    )

    const method = this.magicblockProgram.methods
      .placeTrade(
        tradeBufferIndex,
        inputMint,
        outputMint,
        amountIn,
        slippageBps
      )
      .accounts({
        trader,
        userBalance,
        orderCounter,
        tradeBuffer
      })

    return await method.rpc({ skipPreflight: true })
  }

  async integratePrivateSwap(
    fromToken: string,
    toToken: string,
    amount: string,
    decimals: number,
    userAddress: string,
    slippageBps: number = 100
  ): Promise<string | null> {
    const { setStep } = useAlertStore.getState()

    try {
      setStep("checkingBalance")
      const amountBN = new BN(Math.floor(Number(amount) * 10 ** decimals))
      const userBalanceExists = await this.checkUserBalanceExists()
      if (!userBalanceExists) {
        setStep("creatingAccount")
        await this.createUserBalanceState()
        await new Promise((resolve) => setTimeout(resolve, 5000))
      }

      const availableBuffer = await this.getAvailableTradeBufferFrontend(20)

      if (!availableBuffer) {
        throw new Error("No available trade buffer found.")
      }

      setStep("depositing")
      // const newVal = await this.createTradeBuffer(13)
      // console.log(newVal?.tradeBuffer.toString(), "CHECK NEW TRADE BUFFER")

      const depositTx = await this.depositOnL1(
        new PublicKey(fromToken),
        amountBN,
        new BN(Date.now())
      )
      setStep("waitingBalance", depositTx)

      // // Wait until user's deposited balance becomes available
      const maxRetries = 20
      const retryDelay = 5000
      let retries = 0
      let balanceReady = false
      let availableBalance = new BN(0)

      while (retries < maxRetries) {
        const check = await this.checkUserBalanceAmount(fromToken, amountBN)
        console.log(
          `Retry #${retries + 1}:`,
          check,
          "Waiting for balance update..."
        )

        if (check.isAvailable) {
          balanceReady = true
          break
        }

        await new Promise((resolve) => setTimeout(resolve, retryDelay))
        retries++
      }

      if (!balanceReady) {
        throw new Error("Balance not updated after deposit.")
      }

      setStep("placingTrade")

      const tradeTx = await this.placeTrade(
        new PublicKey(availableBuffer?.address.toString()),
        availableBuffer?.index,
        new PublicKey(fromToken),
        new PublicKey(toToken),
        amountBN,
        slippageBps
      )
      retries = 0
      balanceReady = false
      availableBalance = new BN(0)

      while (retries < maxRetries) {
        const check = await this.checkUserBalanceAmount(toToken)
        console.log(
          `Retry #${retries + 1}:`,
          check,
          "Waiting for balance update..."
        )

        if (check.isAvailable) {
          balanceReady = true
        }
        if (check.availableAmount && check.availableAmount?.toNumber() > 0) {
          availableBalance = check.availableAmount
          break
        }
        await new Promise((resolve) => setTimeout(resolve, retryDelay))
        retries++
      }
      console.log(availableBalance?.toString(), "CHECK AVAILABLE BALANCE")

      if (!balanceReady) {
        throw new Error("Balance not updated after place trade.")
      }
      setStep("preparingWithdraw")
      const withdrawalStateIndex = 2
      // // --- NEW: Withdraw phase (attempt to withdraw output token balance from ER) ---
      const isReady = await this.checkWithdrawalStateReady(withdrawalStateIndex)
      if (!isReady) {
        setStep("creatingWithdrawalState")
        await this.createWithdrawalState(withdrawalStateIndex)
        // small pause to allow records to propagate
        await new Promise((r) => setTimeout(r, 2000))
      }
      // const outputBalance = await this.getUserTokenBalanceOnEr(
      //   new PublicKey(toToken)
      // )
      // console.log(outputBalance.toString(), "CHECK OUTPUT BALANCE")

      // const outputBalance = new BN(22000)
      setStep("placingWithdrawal")
      const magicUser = this.magicUserPk
      if (!magicUser) throw new Error("Magicblock user wallet not available")

      const receivers = [magicUser] // single receiver; change if needed
      const withdrawalTx = await this.placeWithdrawal(
        withdrawalStateIndex,
        new PublicKey(toToken),
        availableBalance,
        receivers
      )

      setStep("completed", withdrawalTx)
      return withdrawalTx
    } catch (err) {
      setStep("failed")
      console.error("Swap error:", err)
      return null
    }
  }
}
