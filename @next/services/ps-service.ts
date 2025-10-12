/* eslint-disable curly */
"use client"

import { type AnchorProvider, BN, Program } from "@coral-xyz/anchor"
import { PrivateSwap } from "@idls"
import {
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

  async checkUserBalanceExists(
    enteredAmount: BN,
    tokenMint: string
  ): Promise<{ acc: boolean; balance: boolean }> {
    try {
      const user = this.userPk
      if (!user) return { acc: false, balance: false }

      const userBalanceAddress = this.deriveUserBalancePda(user)
      const res = await this.magicblockProgram.account.userBalance.fetch(
        userBalanceAddress
      )
      console.log(res, "CHECK RESPONSE FROM BALANCE")

      // Convert BN to BigNumber for comparison
      const entered = new BigNumber(enteredAmount.toString())
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
      const val = res?.balances?.map((item) => {
        console.log(
          item?.amount?.toString(),
          item?.tokenMint?.toString(),
          "CHECK THE BALANCE HERE"
        )
      })
      const val2 = res?.pendingTrades?.map((item) => {
        console.log(
          item?.inputTokenMintWithAmount?.amount?.toString(),
          item?.inputTokenMintWithAmount?.tokenMint?.toString(),
          "CHECK THE PENDING BALANCE"
        )
      })
      // Step 4: Check if available >= entered
      const isEnough = available.gte(entered)

      return { acc: true, balance: isEnough }
    } catch (err) {
      console.error("Error checking user balance:", err)
      return { acc: false, balance: false }
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

  async getAvailableTradeBufferFrontend(
    maxIndex = 10
  ): Promise<{ address: PublicKey; index: number } | null> {
    for (let i = 0; i < maxIndex; i++) {
      const indexBuf = Buffer.from([i & 0xff])
      const [tradeBufferAddress] = PublicKey.findProgramAddressSync(
        [Buffer.from("trade_buffer"), indexBuf],
        this.program.programId
      )

      try {
        const tradeBuffer = await this.program.account.tradeBuffer.fetch(
          tradeBufferAddress
        )

        // You can add your own conditions here
        // For example, check if tradeBuffer.isActive, slotsRemaining > 0, etc.
        // For now, just assume existence means it's available
        if (tradeBuffer) {
          console.log(
            `✅ Found available trade buffer at index ${i}`,
            tradeBufferAddress.toString()
          )
          return { address: tradeBufferAddress, index: i }
        }
      } catch (err) {
        console.log(`❌ No buffer found at index ${i}`)
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
      const userBalanceExists = await this.checkUserBalanceExists(
        amountBN,
        fromToken
      )
      console.log(userBalanceExists, "CHECK USER BALANCE EXIST")

      if (!userBalanceExists?.acc) {
        await this.createUserBalanceState()
      }

      const availableBuffer = await this.getAvailableTradeBufferFrontend(10)

      if (!availableBuffer) {
        throw new Error("No available trade buffer found.")
      }
      console.log(amountBN?.toNumber(), "CHECK VALUE")
      console.log(
        availableBuffer?.address?.toString(),
        availableBuffer?.index,
        "CHECK AVAILABLE TRADE BUFFER"
      )
      // const availableBuffer = await tokenService?.getAvailableBuffer()
      console.log(availableBuffer, "CHECK AVAIULABLE BUFFER")

      setStep("depositing")
      const depositTx = await this.depositOnL1(
        new PublicKey(fromToken),
        amountBN,
        new BN(Date.now())
      )
      // await new Promise((resolve) => setTimeout(resolve, 5000))
      setStep("waitingBalance", depositTx)
      // console.log("Deposit:", depositTx)

      // Wait until user's deposited balance becomes available
      const maxRetries = 15
      const retryDelay = 5000 // 4 seconds between checks
      let retries = 0
      let balanceReady = false

      while (retries < maxRetries) {
        const check = await this.checkUserBalanceExists(amountBN, fromToken)
        console.log(
          `Retry #${retries + 1}:`,
          check,
          "Waiting for balance update..."
        )

        if (check?.balance) {
          balanceReady = true
          break
        }

        await new Promise((resolve) => setTimeout(resolve, retryDelay))
        retries++
      }

      if (!balanceReady) {
        throw new Error("Balance not updated after deposit.")
      }
      // await new Promise((resolve) => setTimeout(resolve, 1500))
      setStep("placingTrade")
      // const tradeBufferIndex = 10
      // const trade_buffer_address =
      //   "9t76R1auSvBYG55kpVNFjWGb7AGTFJPTyyCmZ9KzPF1J"
      // const val = this.createTradeBuffer(2)
      // console.log(val, "CHECK THE VALUE OF TRADE BUFFER")
      // const tradeBufferIndex = 0
      // const bufferData = await this.createTradeBuffer(9)
      // console.log(bufferData?.tradeBuffer?.toString(), "CHECK THE DATA HERE")

      // const indexBuf = Buffer.from([tradeBufferIndex & 0xff])

      // const [tradeBuffer] = PublicKey.findProgramAddressSync(
      //   [Buffer.from("trade_buffer"), indexBuf],
      //   this.program.programId
      // )
      // console.log(tradeBuffer.toString(), "CHECK THE TRADE BUFFER ADDRESS")
      // const bufferAddress = await this.createTradeBuffer(8)
      // console.log(
      //   bufferAddress?.tradeBuffer?.toString(),
      //   "CHECK THE TRADE BUFFER ADDRESS"
      // )

      // const tradeBufferIndex = 8
      // const trade_buffer_address =
      //   "EfY4SU3zfQgjsVy1dJ9g3cQHa9T55JLqcX4MSobQp3mP"
      // // const value = await this.createTradeBuffer(6)
      // // console.log(value?.tradeBuffer?.toString(), "CHECK NEW TRADE BUFFER")

      const tradeTx = await this.placeTrade(
        new PublicKey(availableBuffer?.address.toString()),
        availableBuffer?.index,
        new PublicKey(fromToken),
        new PublicKey(toToken),
        amountBN,
        slippageBps
      )

      setStep("completed", tradeTx)
      return tradeTx
    } catch (err) {
      setStep("failed")
      console.error("Swap error:", err)
      return null
    }
  }

  // async sendTransaction(tx: VersionedTransaction): Promise<string> {
  //   const provider = this.magicblockProgram.provider
  //   const latestBlockHash = await provider.connection.getLatestBlockhash()
  //   const serializeTx2 = VersionedTransaction.deserialize(tx.serialize())
  //   serializeTx2.message.recentBlockhash = latestBlockHash.blockhash
  //   const transactionSimulation = await provider.connection.simulateTransaction(
  //     tx,
  //     {
  //       replaceRecentBlockhash: true
  //     }
  //   )

  //   const transactionLogs = transactionSimulation.value.logs

  //   console.log(transactionLogs, "transactionLogs")
  //   if (!provider.publicKey) return ""
  //   let signature = null
  //   let regularWalletSignedTx = null

  //    const signedTx = await wallet.signAllTransactions?.([tx])
  //   if (!signedTx) {
  //     throw new Error("Transaction Simulation Failed")
  //   }
  //   regularWalletSignedTx = signedTx
  //   signature = encode(signedTx[0].signatures[0] as Uint8Array)
  //   // }

  //   const infoForSentry = {
  //     walletAddress: provider.publicKey?.toBase58(),
  //     deviceUsed: userDevice,
  //     ...txDetailsForSentry
  //   }

  //   console.log("transactionLogs", transactionLogs)

  //   if (regularWalletSignedTx) {
  //     try {
  //       let transactions = [
  //         encode(regularWalletSignedTx[0]?.serialize()),
  //         encode(regularWalletSignedTx[1]?.serialize())
  //       ]
  //       if (tx2) {
  //         transactions = [
  //           encode(regularWalletSignedTx[0]?.serialize()),
  //           encode(regularWalletSignedTx[1]?.serialize()),
  //           encode(regularWalletSignedTx[2]?.serialize())
  //         ]
  //       }
  //       const sendBundle = async () => {
  //         await axios.post(
  //           `${process.env.NEXT_PUBLIC_API_HOST}/tokens/send-bundle-array`,
  //           {
  //             jsonrpc: "2.0",
  //             id: 1,
  //             method: "sendBundle",
  //             transactions
  //           }
  //         )
  //         // await axios.post("https://mainnet.block-engine.jito.wtf/api/v1/bundles", {
  //         //   jsonrpc: "2.0",
  //         //   id: 1,
  //         //   method: "sendBundle",
  //         //   params: transactions
  //         // })
  //       }
  //       if (!tx2) {
  //         await connection.sendRawTransaction(
  //           regularWalletSignedTx[0].serialize(),
  //           {
  //             skipPreflight: true
  //           }
  //         )
  //       }
  //       const RETRIES = 3
  //       for (let attempt = 1; attempt <= RETRIES; attempt++) {
  //         try {
  //           await sendBundle()
  //         } catch (e) {
  //           if (attempt < RETRIES) {
  //             console.error(`Attempt ${attempt} failed. Retrying...`)
  //             setTimeout(() => {}, 1000)
  //             continue
  //           }
  //           console.error(e)
  //         }
  //       }
  //     } catch (error) {}
  //   }
  // }
}
