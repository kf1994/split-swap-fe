"use client"

import { type AnchorProvider, BN, Program } from "@coral-xyz/anchor"
import { PrivateSwap } from "@idls"
import { PublicKey, SystemProgram } from "@solana/web3.js"
import {
  getAssociatedTokenAddressSync,
  TOKEN_2022_PROGRAM_ID,
  TOKEN_PROGRAM_ID
} from "@solana/spl-token"

export class PSService {
  readonly program: Program<typeof PrivateSwap>
  readonly magicblockProgram: Program<typeof PrivateSwap>

  constructor(provider: AnchorProvider, magicblockProvider: AnchorProvider) {
    this.program = new Program(PrivateSwap, provider)
    this.magicblockProgram = new Program(PrivateSwap, magicblockProvider)
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

  async checkUserBalanceExists(): Promise<boolean> {
    try {
      const user = this.userPk
      if (!user) return false
      const userBalanceAddress = this.deriveUserBalancePda(user)
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-expect-error
      await this.program.account.userBalance.fetch(userBalanceAddress)
      return true
    } catch {
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

    const [globalState] = PublicKey.findProgramAddressSync(
      [Buffer.from("global_state")],
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
        globalState,
        tradeBuffer
      })

    return await method.rpc()
  }

  async integratePrivateSwap(
    fromToken: string,
    toToken: string,
    amount: string,
    decimals: number,
    userAddress: string,
    slippageBps: number = 100 // 1% default
  ): Promise<string | null> {
    const userBalanceExists = await this.checkUserBalanceExists()
    if (!userBalanceExists) {
      await this.createUserBalanceState()
    }

    const amountBN = new BN(Math.floor(Number(amount) * 10 ** decimals))

    // Optional: Deposit if required
    const depositTx = await this.depositOnL1(
      new PublicKey(fromToken),
      amountBN,
      new BN(Date.now()) // nonce
    )
    console.log("Deposit:", depositTx)

    const tradeBufferIndex = 0
    const tradeTx = await this.placeTrade(
      new PublicKey(userAddress), // who’s trading
      tradeBufferIndex,
      new PublicKey(fromToken),
      new PublicKey(toToken),
      amountBN,
      slippageBps
    )

    return tradeTx
  }
}
