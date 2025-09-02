"use client"
import { jupiterSource, NodeWalletService, PoolService } from "@services"
import { formatSolToLamports, getPda, getRelatedPool } from "@utils"
import {
  type AnchorProvider,
  type Idl,
  Program,
  type ProgramAccount,
  web3
} from "@coral-xyz/anchor"
import {
  type NodeWallet,
  type Pool,
  type Position,
  type ITrendingCoinsResponse,
  type TokenInfo
} from "@types"
import { LavarageIdl } from "@idls"
import {
  type Account,
  ASSOCIATED_TOKEN_PROGRAM_ID,
  createAssociatedTokenAccountInstruction,
  getAccount,
  getAssociatedTokenAddressSync,
  getMint,
  TOKEN_PROGRAM_ID,
  TokenAccountNotFoundError,
  TokenInvalidAccountOwnerError
} from "@solana/spl-token"
import {
  AddressLookupTableAccount,
  type Keypair,
  LAMPORTS_PER_SOL,
  PublicKey,
  SYSVAR_INSTRUCTIONS_PUBKEY,
  TransactionInstruction,
  TransactionMessage,
  VersionedTransaction
} from "@solana/web3.js"
import BN from "bn.js"
import { BaseService } from "./base-service"
import {
  DELEGATE_OPERATOR_ADDRESS,
  LOWER_THRESHOLD_PERCENT,
  PROFIT_FEE,
  SOL_ADDRESS
} from "@config"
import {
  ReferralProvider,
  PROGRAM_ID as JUP_REFERRAL_PROGRAM_ID
} from "@jup-ag/referral-sdk"
import BigNumber from "bignumber.js"

const API_HOST = process.env.NEXT_PUBLIC_API_HOST ?? ""
const FEE_RECIPIENT = process.env.NEXT_PUBLIC_FEE_RECIPIENT ?? ""
const JUP_REFERRAL_KEY = process.env.NEXT_PUBLIC_JUP_REFERRAL_KEY ?? ""
const JUP_SWAP_REFERRAL_KEY =
  process.env.NEXT_PUBLIC_JUP_SWAP_REFERRAL_KEY ?? ""

export class LavarageService extends BaseService {
  readonly program: Program<typeof LavarageIdl>
  tokenDecimals: Record<string, number> = {}
  positions: Position[] | [] = []
  private readonly nodeWalletService: NodeWalletService
  private readonly poolService: PoolService
  private _walletPublicKey: PublicKey | undefined
  private readonly jupReferralPublicKey = JUP_REFERRAL_KEY
    ? new PublicKey(JUP_REFERRAL_KEY)
    : undefined

  private readonly jupReferralSwapPublicKey = JUP_SWAP_REFERRAL_KEY
    ? new PublicKey(JUP_SWAP_REFERRAL_KEY)
    : this.jupReferralPublicKey

  constructor(provider: AnchorProvider, programId: PublicKey) {
    super()
    this.program = new Program(LavarageIdl as Idl, programId, provider)
    this.nodeWalletService = new NodeWalletService()
    this.poolService = new PoolService(this.program)
    this._walletPublicKey = provider.publicKey
  }

  setWalletPublicKey(walletPublicKey: string) {
    this._walletPublicKey = new PublicKey(walletPublicKey)
  }

  getWalletPublicKey() {
    return this._walletPublicKey
  }

  async getTokenDecimals(
    tokenAddress: string,
    tokenProgram = TOKEN_PROGRAM_ID
  ) {
    if (this.tokenDecimals?.[tokenAddress]) {
      return this.tokenDecimals[tokenAddress]
    }

    const mintPublicKey = new web3.PublicKey(tokenAddress)
    const mintInfo = await getMint(
      this.program.provider.connection,
      mintPublicKey,
      "confirmed",
      tokenProgram
    )
    const decimals = mintInfo.decimals

    this.tokenDecimals[tokenAddress] = decimals

    return decimals
  }

  async getTrendingCoins() {
    return (
      await this.http.get<ITrendingCoinsResponse>(`${API_HOST}/tokens/trending`)
    )?.data?.data
  }

  async getTokenAccountOrCreateIfNotExists(
    ownerPublicKey: PublicKey,
    tokenAddress: PublicKey,
    tokenProgram = TOKEN_PROGRAM_ID
  ) {
    const associatedTokenAddress = getAssociatedTokenAddressSync(
      tokenAddress,
      ownerPublicKey,
      true,
      tokenProgram,
      ASSOCIATED_TOKEN_PROGRAM_ID
    )

    try {
      const tokenAccount = await getAccount(
        this.program.provider.connection,
        associatedTokenAddress,
        "finalized",
        tokenProgram
      )
      return { account: tokenAccount, instruction: null }
    } catch (error) {
      if (
        error instanceof TokenAccountNotFoundError ||
        error instanceof TokenInvalidAccountOwnerError
      ) {
        const instruction = createAssociatedTokenAccountInstruction(
          this.program.provider.publicKey!,
          associatedTokenAddress,
          ownerPublicKey,
          tokenAddress,
          tokenProgram,
          ASSOCIATED_TOKEN_PROGRAM_ID
        )

        return {
          account: {
            address: associatedTokenAddress
          },
          instruction
        }
      } else {
        console.error("Error in getTokenAccountOrCreateIfNotExists: ", error)

        return { account: null, instruction: null }
      }
    }
  }

  getReferralATASync(tokenAddress: PublicKey, isSwap = false) {
    if (
      !this.jupReferralPublicKey ||
      (isSwap && !this.jupReferralSwapPublicKey)
    ) {
      return
    }
    const [feeAccount] = PublicKey.findProgramAddressSync(
      [
        Buffer.from("referral_ata"),
        (isSwap
          ? this.jupReferralSwapPublicKey ?? this.jupReferralPublicKey
          : this.jupReferralPublicKey
        ).toBuffer(),
        tokenAddress.toBuffer()
      ],
      new PublicKey(JUP_REFERRAL_PROGRAM_ID)
    )

    return feeAccount
  }

  async checkAccountExists(address: PublicKey): Promise<boolean> {
    try {
      await getAccount(this.program.provider.connection, address, "finalized")
      return true
    } catch (error) {
      return false
    }
  }

  async getReferralTokenAccountOrCreateIfNotExists(
    tokenAddress: PublicKey,
    isSwap = false
  ) {
    if (
      !this.jupReferralPublicKey ||
      (isSwap && !this.jupReferralSwapPublicKey)
    ) {
      return {
        account: null,
        instruction: null
      }
    }
    const feeAccount = this.getReferralATASync(tokenAddress, isSwap)
    if (!feeAccount) return { account: null, instruction: null }
    try {
      const tokenAccount = await getAccount(
        this.program.provider.connection,
        feeAccount,
        "finalized"
      )
      return { account: tokenAccount, instruction: null }
    } catch (error) {
      if (
        error instanceof TokenAccountNotFoundError ||
        error instanceof TokenInvalidAccountOwnerError
      ) {
        const provider = new ReferralProvider(this.program.provider.connection)
        const { tx, referralTokenAccountPubKey } =
          await provider.initializeReferralTokenAccount({
            payerPubKey: this.program.provider.publicKey!,
            referralAccountPubKey: isSwap
              ? this.jupReferralSwapPublicKey ?? this.jupReferralPublicKey
              : this.jupReferralPublicKey, // Referral Key. You can create this with createReferralAccount.ts.
            mint: tokenAddress
          })

        return {
          account: {
            address: referralTokenAccountPubKey
          },
          instruction: tx.instructions[0]
        }
      } else {
        console.error("Error in getTokenAccountOrCreateIfNotExists: ", error)

        return { account: null, instruction: null }
      }
    }
  }

  async getPools(): Promise<Pool[]> {
    const pools = await this.poolService.getPools()

    const uniqueNodeWalletKeys = [
      ...new Set(pools.map((pool) => pool.nodeWallet.publicKey))
    ]

    const nodeWallets = await this.nodeWalletService.getNodeWallets()

    const uniqueNodeWallets = nodeWallets.filter((wallet: NodeWallet) =>
      uniqueNodeWalletKeys.includes(wallet.publicKey)
    )

    const nodeWalletsMap = uniqueNodeWallets.reduce(
      (acc: Record<string, NodeWallet>, wallet) => {
        acc[wallet.publicKey] = wallet
        return acc
      },
      {}
    )

    return pools.map((pool) => ({
      ...pool,
      nodeWallet: nodeWalletsMap[pool.nodeWallet.publicKey]
    }))
  }

  async getPoolByTokenAddress(tokenAddress: string) {
    const pools = await this.getPools()

    return getRelatedPool(
      { address: tokenAddress } as TokenInfo,
      pools,
      SOL_ADDRESS
    )
  }

  async getPosition(publicKey: string) {
    const positions = await this.program.account.position.all([
      { dataSize: 178 }
    ])

    return positions.filter(
      (f) => f.publicKey.toBase58() === publicKey
    )?.[0] as ProgramAccount<{
      pool: PublicKey
      seed: PublicKey
      userPaid: BN
      amount: BN
    }>
  }

  async getUserPosition(userAddress: string) {
    const positions = await this.program.account.position.all([
      { dataSize: 178 }
    ])

    return positions.filter(
      (f: any) => f.account.trader.toBase58() === userAddress
    ) as Array<
      ProgramAccount<{
        pool: PublicKey
        seed: PublicKey
        userPaid: BN
        amount: BN
      }>
    >
  }

  async openBorrowingPosition(
    positionSize: number,
    tokenAddress: string,
    userPays: number,
    jupInfo: {
      instructions: {
        setupInstructions: Array<Record<string, unknown>>
        swapInstruction: Record<string, unknown>
        addressLookupTableAddresses: string[]
      }
    },
    seed: Keypair,
    poolKey: string,
    nodeWallet: NodeWallet,
    maxInterestRate: number
  ) {
    const [positionSizeBN, userPaysBN] = [
      new BN(formatSolToLamports(positionSize).decimalPlaces(0, 1).toString()),
      new BN(formatSolToLamports(userPays).toString())
    ]

    const mintAccount = await this.program.provider.connection.getAccountInfo(
      new PublicKey(tokenAddress)
    )
    const tokenProgram = mintAccount?.owner

    const tokenAddressPubKey = new PublicKey(tokenAddress)
    const poolPubKey = new PublicKey(poolKey)

    const positionAccountPDA = getPda([
      Buffer.from("position"),
      this.program.provider.publicKey?.toBuffer() as Buffer,
      poolPubKey.toBuffer(),
      seed.publicKey.toBuffer()
    ])

    const fromTokenAccount = await this.getTokenAccountOrCreateIfNotExists(
      this.program.provider.publicKey as PublicKey,
      tokenAddressPubKey,
      tokenProgram
    )

    const toTokenAccount = await this.getTokenAccountOrCreateIfNotExists(
      positionAccountPDA,
      tokenAddressPubKey,
      tokenProgram
    )

    let referralATA:
      | { account: null; instruction: null }
      | { account: Account; instruction: null }
      | {
          account: { address: web3.PublicKey }
          instruction: web3.TransactionInstruction
        } = {
      account: null,
      instruction: null
    }
    if (
      tokenProgram?.toBase58() !== "TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb"
    ) {
      referralATA = await this.getReferralTokenAccountOrCreateIfNotExists(
        tokenAddressPubKey
      )
    }

    const instructionsJup = jupInfo.instructions

    const {
      setupInstructions,
      swapInstruction: swapInstructionPayload,
      addressLookupTableAddresses
    } = instructionsJup

    const deserializeInstruction = (instruction: any) => {
      return new TransactionInstruction({
        programId: new PublicKey(instruction.programId),

        keys: instruction.accounts.map((key: any) => ({
          pubkey: new PublicKey(key.pubkey),
          isSigner: key.isSigner,
          isWritable: key.isWritable
        })),
        data: Buffer.from(instruction.data, "base64")
      })
    }

    const getAddressLookupTableAccounts = async (
      keys: string[]
    ): Promise<AddressLookupTableAccount[]> => {
      const addressLookupTableAccountInfos =
        await this.program.provider.connection.getMultipleAccountsInfo(
          keys.map((key) => new PublicKey(key))
        )

      return addressLookupTableAccountInfos.reduce(
        (acc, accountInfo, index) => {
          const addressLookupTableAddress = keys[index]
          if (accountInfo) {
            const addressLookupTableAccount = new AddressLookupTableAccount({
              key: new PublicKey(addressLookupTableAddress),
              state: AddressLookupTableAccount.deserialize(accountInfo.data)
            })
            acc.push(addressLookupTableAccount)
          }

          return acc
        },
        new Array<AddressLookupTableAccount>()
      )
    }

    const addressLookupTableAccounts: AddressLookupTableAccount[] = []

    addressLookupTableAccounts.push(
      ...(await getAddressLookupTableAccounts(addressLookupTableAddresses))
    )

    const { blockhash } =
      await this.program.provider.connection.getLatestBlockhash("finalized")

    const tradingOpenBorrowInstruction = await this.program.methods
      .tradingOpenBorrow(positionSizeBN, userPaysBN)
      .accountsStrict({
        nodeWallet: nodeWallet.publicKey,
        instructions: SYSVAR_INSTRUCTIONS_PUBKEY,
        tradingPool: poolPubKey,
        positionAccount: positionAccountPDA,
        trader: this.program.provider.publicKey as PublicKey,
        systemProgram: web3.SystemProgram.programId,
        clock: web3.SYSVAR_CLOCK_PUBKEY,
        randomAccountAsId: seed.publicKey.toBase58(),
        feeReceipient: "6JfTobDvwuwZxZP6FR5JPmjdvQ4h4MovkEVH2FPsMSrF"
      })
      .remainingAccounts([
        {
          pubkey: new PublicKey(FEE_RECIPIENT),
          isSigner: false,
          isWritable: true
        }
      ])
      .instruction()

    const openAddCollateralInstruction = await this.program.methods
      .tradingOpenAddCollateral(maxInterestRate)
      .accountsStrict({
        tradingPool: poolPubKey,
        trader: this.program.provider.publicKey as PublicKey,
        mint: tokenAddressPubKey,
        toTokenAccount: toTokenAccount?.account?.address as PublicKey,
        systemProgram: web3.SystemProgram.programId,
        positionAccount: positionAccountPDA,
        randomAccountAsId: seed.publicKey.toBase58()
      })
      .instruction()

    const jupiterIxs = [
      ...setupInstructions.map(deserializeInstruction),
      deserializeInstruction(swapInstructionPayload)
    ]

    const allInstructions = [
      fromTokenAccount.instruction,
      toTokenAccount.instruction,
      tradingOpenBorrowInstruction,
      referralATA.instruction,
      ...jupiterIxs,
      openAddCollateralInstruction
    ].filter(Boolean)

    const messageV0 = new TransactionMessage({
      payerKey: this.program.provider.publicKey as PublicKey,
      recentBlockhash: blockhash,
      instructions: allInstructions as TransactionInstruction[]
    }).compileToV0Message(addressLookupTableAccounts)

    // const simulation = await this.program.provider.connection.simulateTransaction(new VersionedTransaction(messageV0))
    // console.log(simulation.value.logs)

    return new VersionedTransaction(messageV0)
  }

  async partialRepay(
    percentage: number,
    poolKey: string,
    seed: PublicKey,
    borrowedAmount: number
  ) {
    const pool = await this.poolService.getPoolByKey(poolKey)
    const poolPubKey = new PublicKey(poolKey)
    const { blockhash } =
      await this.program.provider.connection.getLatestBlockhash("finalized")
    const positionAccountPDA = getPda([
      Buffer.from("position"),
      this.program.provider.publicKey?.toBuffer() as Buffer,
      poolPubKey.toBuffer(),
      seed.toBuffer()
    ])

    const partialPayIx = await this.program.methods
      .tradingClosePartialRepaySol(new BN(percentage * 100))
      .accountsStrict({
        systemProgram: web3.SystemProgram.programId,
        positionAccount: positionAccountPDA,
        tradingPool: poolPubKey,
        nodeWallet: pool.nodeWallet.publicKey,
        trader: this.program.provider.publicKey as PublicKey,
        feeReceipient: new web3.PublicKey(
          "6JfTobDvwuwZxZP6FR5JPmjdvQ4h4MovkEVH2FPsMSrF"
        ),
        clock: web3.SYSVAR_CLOCK_PUBKEY,
        randomAccountAsId: seed
      })
      .instruction()

    const messageV0 = new TransactionMessage({
      payerKey: this.program.provider.publicKey as PublicKey,
      recentBlockhash: blockhash,
      instructions: [
        partialPayIx,
        ...[
          borrowedAmount > 0.05
            ? web3.SystemProgram.transfer({
                fromPubkey: this.program.provider.publicKey!,
                toPubkey: new PublicKey(FEE_RECIPIENT),
                lamports: new BN(borrowedAmount * LAMPORTS_PER_SOL)
                  .mul(new BN(1))
                  .div(new BN(100))
                  .toNumber()
              })
            : []
        ]
      ].filter(Boolean) as TransactionInstruction[]
    }).compileToV0Message()

    return new VersionedTransaction(messageV0)
  }

  async repaySol(
    poolKey: string,
    borrowedAmount: number,
    seed: PublicKey,
    collateralAmount: number,
    pnl: number
  ) {
    const pool = await this.poolService.getPoolByKey(poolKey)
    const poolPubKey = new PublicKey(poolKey)
    const { blockhash } =
      await this.program.provider.connection.getLatestBlockhash("finalized")
    const tokenAddressPubKey = new PublicKey(pool.baseCurrency.address)

    const quoteMintAccount =
      await this.program.provider.connection.getAccountInfo(
        new PublicKey(pool.quoteCurrency.address)
      )
    const quoteTokenProgram = quoteMintAccount?.owner

    const baseMintAccount =
      await this.program.provider.connection.getAccountInfo(tokenAddressPubKey)
    const baseTokenProgram = baseMintAccount?.owner

    const positionAccountPDA = getPda([
      Buffer.from("position"),
      this.program.provider.publicKey?.toBuffer() as Buffer,
      poolPubKey.toBuffer(),
      seed.toBuffer()
    ])
    const fromTokenAccount = await this.getTokenAccountOrCreateIfNotExists(
      positionAccountPDA,
      tokenAddressPubKey,
      baseTokenProgram
    )
    const toTokenAccount = await this.getTokenAccountOrCreateIfNotExists(
      this.program.provider.publicKey as PublicKey,
      tokenAddressPubKey,
      baseTokenProgram
    )

    const closePositionIx = await this.program.methods
      .tradingCloseBorrowCollateral()
      .accountsStrict({
        tradingPool: poolKey,
        instructions: SYSVAR_INSTRUCTIONS_PUBKEY,
        mint: pool.baseCurrency.address,
        fromTokenAccount: fromTokenAccount?.account?.address as PublicKey,
        toTokenAccount: toTokenAccount?.account?.address as PublicKey,
        positionAccount: positionAccountPDA,
        clock: web3.SYSVAR_CLOCK_PUBKEY,
        systemProgram: web3.SystemProgram.programId,
        trader: this.program.provider.publicKey as PublicKey,
        tokenProgram: baseTokenProgram!,
        randomAccountAsId: seed
      })
      .instruction()

    const jupiterQuote = await jupiterSource.getPrice(
      tokenAddressPubKey.toBase58(),
      SOL_ADDRESS
    )

    const quoteDecimal = await this.getTokenDecimals(
      pool.quoteCurrency.address,
      quoteTokenProgram
    )
    const outputAmount = new BN(
      new BigNumber(collateralAmount)
        .multipliedBy(
          BigNumber(jupiterQuote.data[tokenAddressPubKey.toBase58()].price)
        )
        .times(BigNumber(10).pow(quoteDecimal))
        .toFixed(0)
    )

    const repaySolIx = await this.program.methods
      .tradingCloseRepaySol(outputAmount, new BN(9997))
      .accountsStrict({
        instructions: SYSVAR_INSTRUCTIONS_PUBKEY,
        nodeWallet: pool.nodeWallet.publicKey,
        positionAccount: positionAccountPDA,
        tradingPool: poolKey,
        trader: this.program.provider.publicKey as PublicKey,
        systemProgram: web3.SystemProgram.programId,
        clock: web3.SYSVAR_CLOCK_PUBKEY,
        randomAccountAsId: seed,
        feeReceipient: "6JfTobDvwuwZxZP6FR5JPmjdvQ4h4MovkEVH2FPsMSrF"
      })
      .remainingAccounts([
        {
          pubkey: new PublicKey(FEE_RECIPIENT),
          isSigner: false,
          isWritable: true
        }
      ])
      .instruction()

    const messageV0 = new TransactionMessage({
      payerKey: this.program.provider.publicKey as PublicKey,
      recentBlockhash: blockhash,
      instructions: [
        toTokenAccount.instruction,
        closePositionIx,
        repaySolIx,
        web3.SystemProgram.transfer({
          fromPubkey: this.program.provider.publicKey!,
          toPubkey: new PublicKey(FEE_RECIPIENT),
          lamports:
            pnl > 0
              ? new BN(pnl * LAMPORTS_PER_SOL)
                  .mul(new BN(PROFIT_FEE))
                  .div(new BN(100))
                  .toNumber()
              : 0
        }),
        ...[
          borrowedAmount > 0.1
            ? web3.SystemProgram.transfer({
                fromPubkey: this.program.provider.publicKey!,
                toPubkey: new PublicKey(FEE_RECIPIENT),
                lamports: new BN(borrowedAmount * LAMPORTS_PER_SOL)
                  .mul(new BN(1))
                  .div(new BN(100))
                  .toNumber()
              })
            : null
        ]
      ].filter(Boolean) as TransactionInstruction[]
    }).compileToV0Message()

    return new VersionedTransaction(messageV0)
  }

  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  async sellPosition(
    poolKey: string,
    collateralAmount: string,
    seed: PublicKey,
    sellInfo: {
      quoteResponse: any
      instructions: {
        setupInstructions: Array<Record<string, unknown>>
        swapInstruction: Record<string, unknown>
        cleanupInstruction: Record<string, unknown>
        addressLookupTableAddresses: string[]
        tokenLedgerInstruction?: Record<string, unknown>
      }
    },
    pnl: number
  ) {
    const pool = await this.poolService.getPoolByKey(poolKey)
    const poolPubKey = new PublicKey(poolKey)

    const tokenAddressPubKey = new PublicKey(pool.baseCurrency.address)

    const mintAccount = await this.program.provider.connection.getAccountInfo(
      new PublicKey(pool.baseCurrency.address)
    )
    const tokenProgram = mintAccount?.owner

    const positionAccountPDA = getPda([
      Buffer.from("position"),
      this.program.provider.publicKey!.toBuffer(),
      poolPubKey.toBuffer(),
      seed.toBuffer()
    ])

    const fromTokenAccount = await this.getTokenAccountOrCreateIfNotExists(
      positionAccountPDA,
      tokenAddressPubKey,
      tokenProgram
    )

    const toTokenAccount = await this.getTokenAccountOrCreateIfNotExists(
      this.program.provider.publicKey!,
      tokenAddressPubKey,
      tokenProgram
    )

    const jupiterSellIx = sellInfo.instructions

    const {
      setupInstructions,
      swapInstruction: swapInstructionPayload,
      cleanupInstruction,
      addressLookupTableAddresses,
      tokenLedgerInstruction
    } = jupiterSellIx

    const deserializeInstruction = (instruction: any) => {
      return new TransactionInstruction({
        programId: new PublicKey(instruction.programId),

        keys: instruction.accounts.map((key: any) => ({
          pubkey: new PublicKey(key.pubkey),
          isSigner: key.isSigner,
          isWritable: key.isWritable
        })),
        data: Buffer.from(instruction.data, "base64")
      })
    }

    const getAddressLookupTableAccounts = async (
      keys: string[]
    ): Promise<AddressLookupTableAccount[]> => {
      const addressLookupTableAccountInfos =
        await this.program.provider.connection.getMultipleAccountsInfo(
          keys.map((key) => new PublicKey(key))
        )

      return addressLookupTableAccountInfos.reduce(
        (acc, accountInfo, index) => {
          const addressLookupTableAddress = keys[index]
          if (accountInfo) {
            const addressLookupTableAccount = new AddressLookupTableAccount({
              key: new PublicKey(addressLookupTableAddress),
              state: AddressLookupTableAccount.deserialize(accountInfo.data)
            })
            acc.push(addressLookupTableAccount)
          }

          return acc
        },
        new Array<AddressLookupTableAccount>()
      )
    }

    const addressLookupTableAccounts: AddressLookupTableAccount[] = []

    addressLookupTableAccounts.push(
      ...(await getAddressLookupTableAccounts(addressLookupTableAddresses))
    )

    const { blockhash } =
      await this.program.provider.connection.getLatestBlockhash("finalized")

    const jupiterIxs = [
      ...setupInstructions.map(deserializeInstruction),
      deserializeInstruction(swapInstructionPayload),
      deserializeInstruction(cleanupInstruction)
    ]

    const closePositionIx = await this.program.methods
      .tradingCloseBorrowCollateral()
      .accountsStrict({
        tradingPool: poolKey,
        instructions: SYSVAR_INSTRUCTIONS_PUBKEY,
        mint: pool.baseCurrency.address,
        fromTokenAccount: fromTokenAccount?.account?.address as PublicKey,
        toTokenAccount: toTokenAccount?.account?.address as PublicKey,
        positionAccount: positionAccountPDA,
        clock: web3.SYSVAR_CLOCK_PUBKEY,
        systemProgram: web3.SystemProgram.programId,
        trader: this.program.provider.publicKey as PublicKey,
        tokenProgram: tokenProgram!,
        randomAccountAsId: seed
      })
      .instruction()

    // const decimal = await this.getTokenDecimals(tokenAddressPubKey.toBase58())

    const repaySolIx = await this.program.methods
      .tradingCloseRepaySol(
        new BN(sellInfo.quoteResponse.outAmount),
        new BN(9998)
      )
      .accountsStrict({
        nodeWallet: pool.nodeWallet.publicKey,
        positionAccount: positionAccountPDA,
        tradingPool: poolKey,
        trader: this.program.provider.publicKey as PublicKey,
        systemProgram: web3.SystemProgram.programId,
        clock: web3.SYSVAR_CLOCK_PUBKEY,
        randomAccountAsId: seed,
        feeReceipient: "6JfTobDvwuwZxZP6FR5JPmjdvQ4h4MovkEVH2FPsMSrF"
      })
      .remainingAccounts([
        {
          pubkey: new PublicKey(FEE_RECIPIENT),
          isSigner: false,
          isWritable: true
        }
      ])
      .instruction()

    // const position = await this.getPosition(positionAccountPDA.toBase58())
    // if (!position) return

    const allInstructions = [
      tokenLedgerInstruction
        ? deserializeInstruction(tokenLedgerInstruction)
        : null,
      toTokenAccount.instruction,
      closePositionIx,
      ...jupiterIxs,
      repaySolIx
      // web3.SystemProgram.transfer({
      //   fromPubkey: this.program.provider.publicKey!,
      //   toPubkey: new PublicKey(FEE_RECIPIENT),
      //   lamports: pnl > 0 ? new BN(pnl).mul(new BN(PROFIT_FEE)).div(new BN(100)).mul(new BN(LAMPORTS_PER_SOL)).toNumber() : 0
      // })
    ].filter((i) => i)

    const messageV0 = new TransactionMessage({
      payerKey: this.program.provider.publicKey as PublicKey,
      recentBlockhash: blockhash,
      instructions: allInstructions as TransactionInstruction[]
    }).compileToV0Message(addressLookupTableAccounts)

    // const finalTx = new VersionedTransaction(messageV0)
    // const simulation = await this.program.provider.connection.simulateTransaction(finalTx)
    // console.log(simulation.value.logs)

    return new VersionedTransaction(messageV0)
  }

  async createTakeProfit(price: BigNumber, poolKey: string, seed: PublicKey) {
    if (!this.program.provider.publicKey) {
      throw new Error("Provider public key is not set")
    }

    const pool = await this.poolService.getPoolByKey(poolKey)
    const poolPubKey = new PublicKey(poolKey)
    const { blockhash } =
      await this.program.provider.connection.getLatestBlockhash("finalized")
    const positionAccountPDA = getPda(
      [
        Buffer.from("position"),
        this.program.provider.publicKey?.toBuffer(),
        poolPubKey.toBuffer(),
        seed.toBuffer()
      ],
      this.program.programId.toBase58()
    )
    const delegatePDA = getPda(
      [Buffer.from("delegate"), positionAccountPDA.toBuffer()],
      this.program.programId.toBase58()
    )
    const delegateOperator = new PublicKey(DELEGATE_OPERATOR_ADDRESS)
    const quoteDecimal = await this.getTokenDecimals(pool.quoteCurrency.address)

    const { priceBN, lowerThresholdBN } = this.calculateTakeProfitThresholds(
      price,
      quoteDecimal
    )

    const createTpIx = await this.program.methods
      .tradingCreateTpDelegate(
        new BN(priceBN),
        new BN(lowerThresholdBN),
        delegateOperator,
        new BN(100)
      )
      .accountsStrict({
        delegate: delegatePDA,
        originalOperator: this.program.provider.publicKey,
        delegatedAccount: positionAccountPDA,
        systemProgram: web3.SystemProgram.programId
      })
      .instruction()

    const messageV0 = new TransactionMessage({
      payerKey: this.program.provider.publicKey,
      recentBlockhash: blockhash,
      instructions: [createTpIx].filter(Boolean)
    }).compileToV0Message()
    const versionedTx = new VersionedTransaction(messageV0)

    return versionedTx
  }

  async removeTakeProfit(poolKey: string, seed: PublicKey) {
    if (!this.program.provider.publicKey) {
      throw new Error("Provider public key is not set")
    }

    // const pool = await this.poolService.getPoolByKey(poolKey)
    const poolPubKey = new PublicKey(poolKey)
    const { blockhash } =
      await this.program.provider.connection.getLatestBlockhash("finalized")
    const positionAccountPDA = getPda(
      [
        Buffer.from("position"),
        this.program.provider.publicKey?.toBuffer(),
        poolPubKey.toBuffer(),
        seed.toBuffer()
      ],
      this.program.programId.toBase58()
    )
    const delegatePDA = getPda(
      [Buffer.from("delegate"), positionAccountPDA.toBuffer()],
      this.program.programId.toBase58()
    )

    const removeTpIx = await this.program.methods
      .tradingRemoveTpDelegate()
      .accountsStrict({
        delegate: delegatePDA,
        originalOperator: this.program.provider.publicKey,
        delegatedAccount: positionAccountPDA,
        systemProgram: web3.SystemProgram.programId
      })
      .remainingAccounts([
        {
          pubkey: new PublicKey(FEE_RECIPIENT),
          isSigner: false,
          isWritable: true
        }
      ])
      .instruction()

    const messageV0 = new TransactionMessage({
      payerKey: this.program.provider.publicKey,
      recentBlockhash: blockhash,
      instructions: [removeTpIx].filter(Boolean)
    }).compileToV0Message()
    const versionedTx = new VersionedTransaction(messageV0)

    return versionedTx
  }

  async modifyTakeProfit(price: BigNumber, poolKey: string, seed: PublicKey) {
    if (!this.program.provider.publicKey) {
      throw new Error("Provider public key is not set")
    }

    const pool = await this.poolService.getPoolByKey(poolKey)
    const poolPubKey = new PublicKey(poolKey)
    const { blockhash } =
      await this.program.provider.connection.getLatestBlockhash("finalized")
    const positionAccountPDA = getPda(
      [
        Buffer.from("position"),
        this.program.provider.publicKey?.toBuffer(),
        poolPubKey.toBuffer(),
        seed.toBuffer()
      ],
      this.program.programId.toBase58()
    )
    const delegatePDA = getPda(
      [Buffer.from("delegate"), positionAccountPDA.toBuffer()],
      this.program.programId.toBase58()
    )
    const delegateOperator = new PublicKey(DELEGATE_OPERATOR_ADDRESS)
    const quoteDecimal = await this.getTokenDecimals(pool.quoteCurrency.address)

    const { priceBN, lowerThresholdBN } = this.calculateTakeProfitThresholds(
      price,
      quoteDecimal
    )

    const removeTpIx = await this.program.methods
      .tradingRemoveTpDelegate()
      .accountsStrict({
        delegate: delegatePDA,
        originalOperator: this.program.provider.publicKey,
        delegatedAccount: positionAccountPDA,
        systemProgram: web3.SystemProgram.programId
      })
      .instruction()

    const createTpIx = await this.program.methods
      .tradingCreateTpDelegate(
        new BN(priceBN),
        new BN(lowerThresholdBN),
        delegateOperator,
        new BN(100)
      )
      .accountsStrict({
        delegate: delegatePDA,
        originalOperator: this.program.provider.publicKey,
        delegatedAccount: positionAccountPDA,
        systemProgram: web3.SystemProgram.programId
      })
      .remainingAccounts([
        {
          pubkey: new PublicKey(FEE_RECIPIENT),
          isSigner: false,
          isWritable: true
        }
      ])
      .instruction()

    const messageV0 = new TransactionMessage({
      payerKey: this.program.provider.publicKey,
      recentBlockhash: blockhash,
      instructions: [removeTpIx, createTpIx].filter(Boolean)
    }).compileToV0Message()
    const versionedTx = new VersionedTransaction(messageV0)

    return versionedTx
  }

  async getTakeProfit(positionKey: string) {
    const delegates = await this.program.account.delegate.all()

    const delegate = delegates.filter(
      (d) => d.account.account?.toString() === positionKey
    )

    return delegate?.[0]?.account?.field1?.toString()
  }

  calculateTakeProfitThresholds(price: BigNumber, quoteDecimal: number) {
    const priceBN = new BN(
      new BigNumber(price)
        .multipliedBy(BigNumber(10).pow(quoteDecimal))
        .integerValue(BigNumber.ROUND_FLOOR)
        .toString()
    )

    const lowerThresholdBN = new BN(
      new BigNumber(price.times(1 - LOWER_THRESHOLD_PERCENT / 100))
        .multipliedBy(BigNumber(10).pow(quoteDecimal))
        .integerValue(BigNumber.ROUND_FLOOR)
        .toString()
    )

    return { priceBN, lowerThresholdBN }
  }
}
