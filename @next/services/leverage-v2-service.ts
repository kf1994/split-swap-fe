import { type AnchorProvider, Program, web3 } from "@coral-xyz/anchor"
import {
  Account,
  ASSOCIATED_TOKEN_PROGRAM_ID,
  createAssociatedTokenAccountInstruction,
  createTransferInstruction,
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
  PublicKey,
  SYSVAR_INSTRUCTIONS_PUBKEY,
  TransactionInstruction,
  TransactionMessage,
  VersionedTransaction
} from "@solana/web3.js"
import BigNumber from "bignumber.js"
import BN from "bn.js"
import { BaseService } from "./base-service"
import { LavarageV2Idl } from "@idls"
import { NodeWallet, Pool, Position, TokenInfo } from "@types"
import { NodeWalletService } from "./node-wallets-service"
import { PoolService } from "./pool-service"
import { getPda, getRelatedPool } from "@utils"
import { jupiterSource } from "./jupiter-source"
import {
  DELEGATE_OPERATOR_ADDRESS,
  JUP_REFERRAL_KEY,
  JUP_SWAP_REFERRAL_KEY,
  LOWER_THRESHOLD_PERCENT,
  PROFIT_FEE,
  USDC_ADDRESS
} from "@config"
import { PROGRAM_ID as JUP_REFERRAL_PROGRAM_ID, ReferralProvider } from "@jup-ag/referral-sdk"

const FEE_RECIPIENT = process.env.NEXT_PUBLIC_FEE_RECIPIENT ?? ""

const getQuoteCurrencySpecificAddressLookupTable = (quoteCurrency: string) => {
  switch (quoteCurrency) {
    case "J9BcrQfX4p9D1bvLzRNCbMDv8f44a9LFdeqNE4Yk2WMD":
      return "2EdNtwVhyjkEgkKDC7GShfSSczZYMKLuJraeoJzG4E4R"
    case "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v":
      return "CxLE1LRaZg2eYygzFfVRhgmSACsvqzyhySDrMHq3QSab"
    default:
      return "2EdNtwVhyjkEgkKDC7GShfSSczZYMKLuJraeoJzG4E4R"
  }
}

export class LavarageV2Service extends BaseService {
  readonly program: Program<typeof LavarageV2Idl>
  tokenDecimals: Record<string, number> = {}
  positions: Position[] | [] = []
  private readonly nodeWalletService: NodeWalletService
  private readonly poolService: PoolService
  private _walletPublicKey: PublicKey | undefined
  private tokenDecimalsCache: Record<string, number> = {}
  private readonly jupReferralPublicKey = JUP_REFERRAL_KEY ? new PublicKey(JUP_REFERRAL_KEY) : undefined
  private readonly jupReferralSwapPublicKey = JUP_SWAP_REFERRAL_KEY
    ? new PublicKey(JUP_SWAP_REFERRAL_KEY)
    : this.jupReferralPublicKey

  constructor(provider: AnchorProvider, programId: PublicKey) {
    super()
    this.program = new Program(LavarageV2Idl, programId, provider)
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

  async getTokenDecimals(tokenAddress: string, tokenProgram = TOKEN_PROGRAM_ID) {
    if (this.tokenDecimals?.[tokenAddress]) {
      return this.tokenDecimals[tokenAddress]
    }

    const mintPublicKey = new web3.PublicKey(tokenAddress)
    const mintInfo = await getMint(this.program.provider.connection, mintPublicKey, "confirmed", tokenProgram)
    const decimals = mintInfo.decimals

    this.tokenDecimals[tokenAddress] = decimals

    return decimals
  }

  async getTokenAccountOrCreateIfNotExists(
    ownerPublicKey: PublicKey,
    tokenAddress: PublicKey,
    tokenProgram = TOKEN_PROGRAM_ID
  ) {
    if (!this._walletPublicKey) {
      throw new Error("Provider public key is not set")
    }

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
      if (error instanceof TokenAccountNotFoundError || error instanceof TokenInvalidAccountOwnerError) {
        const instruction = createAssociatedTokenAccountInstruction(
          this._walletPublicKey,
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

  async getPools(): Promise<Pool[]> {
    const pools = await this.poolService.getPools()

    const uniqueNodeWalletKeys = [...new Set(pools.map((pool) => pool.nodeWallet.publicKey))]

    const nodeWallets = await this.nodeWalletService.getNodeWallets()

    const uniqueNodeWallets = nodeWallets.filter((wallet: NodeWallet) => uniqueNodeWalletKeys.includes(wallet.publicKey))

    const nodeWalletsMap = uniqueNodeWallets.reduce((acc: any, wallet) => {
      acc[wallet.publicKey] = wallet
      return acc
    }, {})

    return pools.map((pool) => ({
      ...pool,
      nodeWallet: nodeWalletsMap[pool.nodeWallet.publicKey]
    }))
  }

  async getPoolByTokenAddress(tokenAddress: string, quoteToken: string) {
    const pools = await this.getPools()

    return getRelatedPool({ address: tokenAddress } as TokenInfo, pools, quoteToken)
  }

  async batchGetTokenDecimals(tokenAddresses: any) {
    const decimalsInfo: any = {}

    for (const address of tokenAddresses) {
      if (!this.tokenDecimalsCache[address]) {
        const mintPublicKey = new web3.PublicKey(address)
        const mintInfo = await getMint(this.program.provider.connection, mintPublicKey)
        this.tokenDecimalsCache[address] = mintInfo.decimals
      }
      decimalsInfo[address] = this.tokenDecimalsCache[address]
    }

    return decimalsInfo
  }

  getReferralATASync(tokenAddress: PublicKey, isSwap = false) {
    if (!this.jupReferralPublicKey || (isSwap && !this.jupReferralSwapPublicKey)) return
    const [feeAccount] = PublicKey.findProgramAddressSync(
      [
        Buffer.from("referral_ata"),
        (isSwap ? this.jupReferralSwapPublicKey ?? this.jupReferralPublicKey : this.jupReferralPublicKey).toBuffer(),
        tokenAddress.toBuffer()
      ],
      new PublicKey(JUP_REFERRAL_PROGRAM_ID)
    )

    return feeAccount
  }

  async getReferralTokenAccountOrCreateIfNotExists(tokenAddress: PublicKey, isSwap = false) {
    if (!this.jupReferralPublicKey || (isSwap && !this.jupReferralSwapPublicKey))
      return {
        account: null,
        instruction: null
      }
    const feeAccount = this.getReferralATASync(tokenAddress, isSwap)
    if (!feeAccount) return { account: null, instruction: null }
    try {
      const tokenAccount = await getAccount(this.program.provider.connection, feeAccount, "finalized")
      return { account: tokenAccount, instruction: null }
    } catch (error) {
      if (error instanceof TokenAccountNotFoundError || error instanceof TokenInvalidAccountOwnerError) {
        const provider = new ReferralProvider(this.program.provider.connection)
        const { tx, referralTokenAccountPubKey } = await provider.initializeReferralTokenAccount({
          payerPubKey: this._walletPublicKey!,
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

  async openBorrowingPosition(
    positionSize: number,
    tokenAddress: string,
    userPays: number,
    jupInfo: {
      instructions: {
        setupInstructions: Record<string, unknown>[]
        swapInstruction: Record<string, unknown>
        addressLookupTableAddresses: string[]
      }
    },
    seed: Keypair,
    poolKey: string,
    nodeWallet: NodeWallet,
    maxInterestRate: number,
    quoteToken: string
  ) {
    if (!this._walletPublicKey) {
      throw new Error("Provider public key is not set")
    }

    const mintAccount = await this.program.provider.connection.getAccountInfo(new PublicKey(tokenAddress))
    const tokenProgram = mintAccount?.owner

    const quoteMintAccount = await this.program.provider.connection.getAccountInfo(new PublicKey(quoteToken))
    const quoteTokenProgram = quoteMintAccount?.owner

    // TODO: fix, no hardcoded decimals
    const [positionSizeBN, userPaysBN] = [
      new BN(new BigNumber(positionSize).multipliedBy(BigNumber(10).pow(6)).decimalPlaces(0, 1).toString()),
      new BN(new BigNumber(userPays).multipliedBy(BigNumber(10).pow(6)).decimalPlaces(0, 1).toString())
    ]

    const tokenAddressPubKey = new PublicKey(tokenAddress)
    const poolPubKey = new PublicKey(poolKey)

    const positionAccountPDA = getPda(
      [Buffer.from("position"), this._walletPublicKey?.toBuffer(), poolPubKey.toBuffer(), seed.publicKey.toBuffer()],
      this.program.programId.toBase58()
    )

    const fromTokenAccount = await this.getTokenAccountOrCreateIfNotExists(
      this._walletPublicKey,
      tokenAddressPubKey,
      tokenProgram
    )
    const toTokenAccount = await this.getTokenAccountOrCreateIfNotExists(
      positionAccountPDA,
      tokenAddressPubKey,
      tokenProgram
    )
    // const tokenAccountCreationTx = new web3.Transaction()

    let referralATA:
      | { account: null; instruction: null }
      | { account: Account; instruction: null }
      | { account: { address: web3.PublicKey }; instruction: web3.TransactionInstruction } = {
      account: null,
      instruction: null
    }

    // if (tokenProgram?.toBase58() !== "TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb") {
    //   referralATA = await this.getReferralTokenAccountOrCreateIfNotExists(tokenAddressPubKey)
    // }

    // if (fromTokenAccount.instruction) {
    //   tokenAccountCreationTx.add(fromTokenAccount.instruction)
    // }
    //
    // if (toTokenAccount.instruction) {
    //   tokenAccountCreationTx.add(toTokenAccount.instruction)
    // }

    // if (referralATA.instruction) {
    //   tokenAccountCreationTx.add(referralATA.instruction)
    // }

    const instructionsJup = jupInfo.instructions

    const { setupInstructions, swapInstruction: swapInstructionPayload, addressLookupTableAddresses } = instructionsJup

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

    const getAddressLookupTableAccounts = async (keys: string[]): Promise<AddressLookupTableAccount[]> => {
      const addressLookupTableAccountInfos = await this.program.provider.connection.getMultipleAccountsInfo(
        keys.map((key) => new PublicKey(key))
      )

      return addressLookupTableAccountInfos.reduce((acc, accountInfo, index) => {
        const addressLookupTableAddress = keys[index]
        if (accountInfo) {
          const addressLookupTableAccount = new AddressLookupTableAccount({
            key: new PublicKey(addressLookupTableAddress),
            state: AddressLookupTableAccount.deserialize(accountInfo.data)
          })
          acc.push(addressLookupTableAccount)
        }

        return acc
      }, new Array<AddressLookupTableAccount>())
    }

    const addressLookupTableAccounts: AddressLookupTableAccount[] = []

    addressLookupTableAccounts.push(
      ...(await getAddressLookupTableAccounts([
        getQuoteCurrencySpecificAddressLookupTable(quoteToken!),
        "5LEAB3owNUSKvECm7vkr58tDtQpzbngQ2NYpc7qmRFdi",
        ...addressLookupTableAddresses
      ]))
    )

    const { blockhash } = await this.program.provider.connection.getLatestBlockhash("finalized")

    const tradingOpenBorrowInstruction = await this.program.methods
      .tradingOpenBorrow(positionSizeBN, userPaysBN)
      .accountsStrict({
        nodeWallet: nodeWallet.publicKey,
        instructions: SYSVAR_INSTRUCTIONS_PUBKEY,
        tradingPool: poolPubKey,
        positionAccount: positionAccountPDA,
        trader: this._walletPublicKey,
        systemProgram: web3.SystemProgram.programId,
        clock: web3.SYSVAR_CLOCK_PUBKEY,
        randomAccountAsId: seed.publicKey.toBase58(),
        feeTokenAccount: getAssociatedTokenAddressSync(
          new PublicKey(quoteToken),
          new PublicKey("6JfTobDvwuwZxZP6FR5JPmjdvQ4h4MovkEVH2FPsMSrF"),
          true,
          quoteTokenProgram
        ),
        toTokenAccount: getAssociatedTokenAddressSync(
          new PublicKey(quoteToken),
          this._walletPublicKey!,
          true,
          quoteTokenProgram
        ),
        tokenProgram: quoteTokenProgram!,
        fromTokenAccount: getAssociatedTokenAddressSync(
          new PublicKey(quoteToken),
          new PublicKey(nodeWallet.publicKey),
          true,
          quoteTokenProgram
        )
      })
      .remainingAccounts([
        {
          pubkey: getAssociatedTokenAddressSync(
            new PublicKey(quoteToken),
            new PublicKey(FEE_RECIPIENT),
            false,
            quoteTokenProgram
          ),
          isSigner: false,
          isWritable: true
        }
      ])
      // .remainingAccounts(
      //   partnerFeeRecipient && partnerFeeMarkupAsPkey
      //     ? [
      //         {
      //           pubkey: getAssociatedTokenAddressSync(
      //             new PublicKey(quoteToken),
      //             partnerFeeRecipient,
      //             false,
      //             quoteTokenProgram
      //           ),
      //           isSigner: false,
      //           isWritable: true
      //         },
      //         {
      //           pubkey: partnerFeeMarkupAsPkey,
      //           isSigner: false,
      //           isWritable: false
      //         }
      //       ]
      //     : []
      // )
      .instruction()
    //
    // const tradingOpenBorrowInstruction = await this.program.methods
    //   .tradingOpenBorrow(positionSizeBN, userPaysBN)
    //   .accountsStrict({
    //     nodeWallet: nodeWallet.publicKey,
    //     instructions: SYSVAR_INSTRUCTIONS_PUBKEY,
    //     tradingPool: poolPubKey,
    //     positionAccount: positionAccountPDA,
    //     trader: this.program.provider.publicKey,
    //     systemProgram: web3.SystemProgram.programId,
    //     clock: web3.SYSVAR_CLOCK_PUBKEY,
    //     randomAccountAsId: seed.publicKey.toBase58(),
    //     tokenProgram: quoteTokenProgram!,
    //     feeTokenAccount: getAssociatedTokenAddressSync(
    //       new PublicKey(quoteToken),
    //       new PublicKey("6JfTobDvwuwZxZP6FR5JPmjdvQ4h4MovkEVH2FPsMSrF")
    //     ),
    //     // TODO: this is hardcoded USDC account, change it to the actual token account
    //     fromTokenAccount: getAssociatedTokenAddressSync(
    //       new PublicKey(quoteToken),
    //       new PublicKey(nodeWallet.publicKey),
    //       true
    //     ),
    //     // fromTokenAccount: fromTokenAccount.instruction,
    //     // the User's USDC token account
    //     toTokenAccount: getAssociatedTokenAddressSync(new PublicKey(quoteToken), this.program.provider.publicKey)
    //   })
    //   .remainingAccounts([
    //     {
    //       pubkey: getAssociatedTokenAddressSync(new PublicKey(quoteToken), new PublicKey(FEE_RECIPIENT)),
    //       isSigner: false,
    //       isWritable: true
    //     }
    //   ])
    //   .instruction()

    const openAddCollateralInstruction = await this.program.methods
      .tradingOpenAddCollateral(maxInterestRate)
      .accountsStrict({
        tradingPool: poolPubKey,
        trader: this._walletPublicKey,
        mint: tokenAddressPubKey,
        toTokenAccount: (toTokenAccount.account as Account).address,
        systemProgram: web3.SystemProgram.programId,
        positionAccount: positionAccountPDA,
        randomAccountAsId: seed.publicKey.toBase58()
      })
      .instruction()

    const jupiterIxs = [
      ...setupInstructions.filter((s) => !!s.programId).map(deserializeInstruction),
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
      payerKey: this._walletPublicKey,
      recentBlockhash: blockhash,
      instructions: allInstructions as TransactionInstruction[]
    }).compileToV0Message(addressLookupTableAccounts)

    const tx = new VersionedTransaction(messageV0)
    // const transactionSimulation = await this.program.provider.connection.simulateTransaction(tx, {
    //   replaceRecentBlockhash: true
    // })
    // const transactionLogs = transactionSimulation.value.logs
    // console.log(transactionLogs)

    return tx
  }

  async repaySol(poolKey: string, borrowedAmount: number, seed: PublicKey, collateralAmount: number, pnl: number) {
    if (!this._walletPublicKey) {
      throw new Error("Provider public key is not set")
    }

    const pool = await this.poolService.getPoolByKey(poolKey)
    const poolPubKey = new PublicKey(poolKey)
    const { blockhash } = await this.program.provider.connection.getLatestBlockhash("finalized")
    const tokenAddressPubKey = new PublicKey(pool.baseCurrency.address)

    const quoteMintAccount = await this.program.provider.connection.getAccountInfo(new PublicKey(pool.quoteCurrency.address))
    const quoteTokenProgram = quoteMintAccount?.owner

    const baseMintAccount = await this.program.provider.connection.getAccountInfo(tokenAddressPubKey)
    const baseTokenProgram = baseMintAccount?.owner

    const positionAccountPDA = getPda(
      [Buffer.from("position"), this._walletPublicKey?.toBuffer(), poolPubKey.toBuffer(), seed.toBuffer()],
      this.program.programId.toBase58()
    )
    const fromTokenAccount = await this.getTokenAccountOrCreateIfNotExists(
      positionAccountPDA,
      tokenAddressPubKey,
      baseTokenProgram
    )
    const toTokenAccount = await this.getTokenAccountOrCreateIfNotExists(
      this._walletPublicKey,
      tokenAddressPubKey,
      baseTokenProgram
    )
    const closePositionIx = await this.program.methods
      .tradingCloseBorrowCollateral()
      .accountsStrict({
        tradingPool: poolKey,
        instructions: SYSVAR_INSTRUCTIONS_PUBKEY,
        mint: pool.baseCurrency.address,
        fromTokenAccount: (fromTokenAccount.account as Account).address,
        toTokenAccount: (toTokenAccount.account as Account).address,
        positionAccount: positionAccountPDA,
        clock: web3.SYSVAR_CLOCK_PUBKEY,
        systemProgram: web3.SystemProgram.programId,
        trader: this._walletPublicKey,
        tokenProgram: baseTokenProgram!,
        randomAccountAsId: seed
      })
      .instruction()

    const jupiterQuote = await jupiterSource.getPrice(tokenAddressPubKey.toBase58(), pool.quoteCurrency.address)

    const quoteDecimal = await this.getTokenDecimals(pool.quoteCurrency.address, quoteTokenProgram)

    const fromUserTokenAccount = getAssociatedTokenAddressSync(
      new PublicKey(pool.quoteCurrency.address),
      this._walletPublicKey,
      true,
      quoteTokenProgram
    )
    const platformTokenAccount = getAssociatedTokenAddressSync(
      new PublicKey(pool.quoteCurrency.address),
      new PublicKey(FEE_RECIPIENT),
      true,
      quoteTokenProgram
    )
    const repaySolIx = await this.program.methods
      .tradingCloseRepaySol(
        new BN(
          new BigNumber(collateralAmount)
            .multipliedBy(BigNumber(jupiterQuote.data[tokenAddressPubKey.toBase58()].price))
            .times(BigNumber(10).pow(quoteDecimal))
            .toFixed(0)
        ),
        new BN(9997)
      )
      .accountsStrict({
        nodeWallet: pool.nodeWallet.publicKey,
        positionAccount: positionAccountPDA,
        tradingPool: poolKey,
        trader: this._walletPublicKey,
        systemProgram: web3.SystemProgram.programId,
        clock: web3.SYSVAR_CLOCK_PUBKEY,
        randomAccountAsId: seed,
        feeTokenAccount: getAssociatedTokenAddressSync(
          new PublicKey(pool.quoteCurrency.address),
          new PublicKey("6JfTobDvwuwZxZP6FR5JPmjdvQ4h4MovkEVH2FPsMSrF")
        ),
        tokenProgram: quoteTokenProgram!,
        fromTokenAccount: fromUserTokenAccount,
        toTokenAccount: getAssociatedTokenAddressSync(
          new PublicKey(pool.quoteCurrency.address),
          new PublicKey(pool.nodeWallet.publicKey),
          true,
          quoteTokenProgram
        ),
        mint: pool.quoteCurrency.address
      })
      .remainingAccounts([
        {
          pubkey: platformTokenAccount,
          isSigner: false,
          isWritable: true
        }
      ])
      .instruction()

    let profitFeeIx: web3.TransactionInstruction | null = null

    // if (pnl > 0) {
    //   profitFeeIx = createTransferInstruction(
    //     fromUserTokenAccount,
    //     platformTokenAccount, // Destination token account
    //     this._walletPublicKey, // Authority to sign the transaction
    //     new BN(pnl)
    //       .mul(new BN(10 ** (pool.quoteCurrency?.decimals ?? 6)))
    //       .mul(new BN(PROFIT_FEE))
    //       .div(new BN(100))
    //       .toNumber(), // Amount to transfer (in smallest units)
    //     [], // Multi-signature signers (optional)
    //     quoteTokenProgram! // SPL Token program ID
    //   )
    // }

    let tradeFee: web3.TransactionInstruction | null = null

    if (borrowedAmount > 10) {
      tradeFee = createTransferInstruction(
        fromUserTokenAccount,
        platformTokenAccount, // Destination token account
        this._walletPublicKey, // Authority to sign the transaction
        new BN(borrowedAmount)
          .mul(new BN(10 ** (pool.quoteCurrency?.decimals ?? 6)))
          .mul(new BN(1))
          .div(new BN(100))
          .toNumber(),
        [], // Multi-signature signers (optional)
        quoteTokenProgram! // SPL Token program ID
      )
    }

    const messageV0 = new TransactionMessage({
      payerKey: this._walletPublicKey,
      recentBlockhash: blockhash,
      instructions: [
        toTokenAccount.instruction,
        closePositionIx,
        repaySolIx,
        ...(profitFeeIx ? [profitFeeIx] : []),
        ...(tradeFee ? [tradeFee] : [])
      ].filter(Boolean) as TransactionInstruction[]
    }).compileToV0Message()

    // const tx = new VersionedTransaction(messageV0)
    // const transactionSimulation = await this.program.provider.connection.simulateTransaction(tx, {
    //   replaceRecentBlockhash: true
    // })
    // const transactionLogs = transactionSimulation.value.logs
    // console.log(transactionLogs)

    return new VersionedTransaction(messageV0)
  }

  async partialRepay(repayPercent: number, poolKey: string, seed: PublicKey, borrowedAmount: number) {
    if (!this._walletPublicKey) {
      throw new Error("Provider public key is not set")
    }

    // const pool = await this.poolService.getPoolByKey(poolKey)
    const poolPubKey = new PublicKey(poolKey)
    const { blockhash } = await this.program.provider.connection.getLatestBlockhash("finalized")
    const pool = await this.poolService.getPoolByKey(poolKey)
    const positionAccountPDA = getPda(
      [Buffer.from("position"), this._walletPublicKey?.toBuffer(), poolPubKey.toBuffer(), seed.toBuffer()],
      this.program.programId.toBase58()
    )

    const baseMintAccount = await this.program.provider.connection.getAccountInfo(new PublicKey(pool.baseCurrency.address))
    const baseTokenProgram = baseMintAccount?.owner

    const quoteMintAccount = await this.program.provider.connection.getAccountInfo(new PublicKey(pool.quoteCurrency.address))
    const quoteTokenProgram = quoteMintAccount?.owner

    const fromUserTokenAccount = getAssociatedTokenAddressSync(
      new PublicKey(pool.quoteCurrency.address),
      this._walletPublicKey,
      true,
      quoteTokenProgram
    )
    const platformTokenAccount = getAssociatedTokenAddressSync(
      new PublicKey(pool.quoteCurrency.address),
      new PublicKey(FEE_RECIPIENT),
      true,
      quoteTokenProgram
    )
    const partialRepayIx = await this.program.methods
      .tradingPartialRepaySol(new BN(repayPercent * 100))
      .accountsStrict({
        systemProgram: web3.SystemProgram.programId,
        positionAccount: positionAccountPDA,
        tradingPool: poolKey,
        nodeWallet: pool.nodeWallet.publicKey,
        trader: this._walletPublicKey,
        // feeReceipient: new web3.PublicKey('6JfTobDvwuwZxZP6FR5JPmjdvQ4h4MovkEVH2FPsMSrF'),
        clock: web3.SYSVAR_CLOCK_PUBKEY,
        randomAccountAsId: seed,
        fromTokenAccount: fromUserTokenAccount,
        toTokenAccount: getAssociatedTokenAddressSync(
          new PublicKey(pool.quoteCurrency.address),
          new PublicKey(pool.nodeWallet.publicKey),
          true,
          quoteTokenProgram
        ),
        mint: pool.quoteCurrency.address,
        feeTokenAccount: getAssociatedTokenAddressSync(
          new PublicKey(pool.quoteCurrency.address),
          new PublicKey("6JfTobDvwuwZxZP6FR5JPmjdvQ4h4MovkEVH2FPsMSrF"),
          true,
          quoteTokenProgram
        ),
        tokenProgram: quoteTokenProgram!
      })
      .instruction()

    let tradeFee: web3.TransactionInstruction | null = null

    if (borrowedAmount > 10) {
      tradeFee = createTransferInstruction(
        fromUserTokenAccount,
        platformTokenAccount, // Destination token account
        this._walletPublicKey, // Authority to sign the transaction
        new BN(borrowedAmount)
          .mul(new BN(10 ** (pool.quoteCurrency?.decimals ?? 6)))
          .mul(new BN(1))
          .div(new BN(100))
          .toNumber(),
        [], // Multi-signature signers (optional)
        quoteTokenProgram // SPL Token program ID
      )
    }
    // console.log('partialRepayIx', partialRepayIx)
    const messageV0 = new TransactionMessage({
      payerKey: this._walletPublicKey,
      recentBlockhash: blockhash,
      instructions: [partialRepayIx, ...(tradeFee ? [tradeFee] : [])].filter(Boolean)
    }).compileToV0Message()
    return new VersionedTransaction(messageV0)
  }

  async sellPosition(
    poolKey: string,
    collateralAmount: string,
    seed: PublicKey,
    sellInfo: {
      quoteResponse: {
        outAmount: string | number | number[] | Buffer
      }
      instructions: {
        setupInstructions: Record<string, unknown>[]
        swapInstruction: Record<string, unknown>
        cleanupInstruction: Record<string, unknown>
        addressLookupTableAddresses: string[]
        tokenLedgerInstruction?: Record<string, unknown>
      }
    },
    pnl: number
  ) {
    if (!this._walletPublicKey) {
      throw new Error("Provider public key is not set")
    }

    const pool = await this.poolService.getPoolByKey(poolKey)
    const poolPubKey = new PublicKey(poolKey)

    const tokenAddressPubKey = new PublicKey(pool.baseCurrency.address)

    const mintAccount = await this.program.provider.connection.getAccountInfo(new PublicKey(pool.baseCurrency.address))
    const tokenProgram = mintAccount?.owner

    const quoteMintAccount = await this.program.provider.connection.getAccountInfo(new PublicKey(pool.quoteCurrency.address))
    const quoteTokenProgram = quoteMintAccount?.owner

    const positionAccountPDA = getPda(
      [Buffer.from("position"), this._walletPublicKey.toBuffer(), poolPubKey.toBuffer(), seed.toBuffer()],
      this.program.programId.toBase58()
    )

    const fromTokenAccount = await this.getTokenAccountOrCreateIfNotExists(
      positionAccountPDA,
      tokenAddressPubKey,
      tokenProgram
    )

    const toTokenAccount = await this.getTokenAccountOrCreateIfNotExists(
      this._walletPublicKey,
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

    const getAddressLookupTableAccounts = async (keys: string[]): Promise<AddressLookupTableAccount[]> => {
      const addressLookupTableAccountInfos = await this.program.provider.connection.getMultipleAccountsInfo(
        keys.map((key) => new PublicKey(key))
      )

      return addressLookupTableAccountInfos.reduce((acc, accountInfo, index) => {
        const addressLookupTableAddress = keys[index]
        if (accountInfo) {
          const addressLookupTableAccount = new AddressLookupTableAccount({
            key: new PublicKey(addressLookupTableAddress),
            state: AddressLookupTableAccount.deserialize(accountInfo.data)
          })
          acc.push(addressLookupTableAccount)
        }

        return acc
      }, new Array<AddressLookupTableAccount>())
    }

    const addressLookupTableAccounts: AddressLookupTableAccount[] = []

    addressLookupTableAccounts.push(
      ...(await getAddressLookupTableAccounts([
        getQuoteCurrencySpecificAddressLookupTable(pool.quoteCurrency.address),
        "5LEAB3owNUSKvECm7vkr58tDtQpzbngQ2NYpc7qmRFdi",
        ...addressLookupTableAddresses
      ]))
    )

    const { blockhash } = await this.program.provider.connection.getLatestBlockhash("finalized")

    const jupiterIxs = [
      ...setupInstructions.filter((s) => !!s.programId).map(deserializeInstruction),
      deserializeInstruction(swapInstructionPayload),
      cleanupInstruction ? deserializeInstruction(cleanupInstruction) : null
    ].filter(Boolean)

    const closePositionIx = await this.program.methods
      .tradingCloseBorrowCollateral()
      .accountsStrict({
        tradingPool: poolKey,
        instructions: SYSVAR_INSTRUCTIONS_PUBKEY,
        mint: pool.baseCurrency.address,
        fromTokenAccount: (fromTokenAccount.account as Account).address,
        toTokenAccount: (toTokenAccount.account as Account).address,
        positionAccount: positionAccountPDA,
        clock: web3.SYSVAR_CLOCK_PUBKEY,
        systemProgram: web3.SystemProgram.programId,
        trader: this._walletPublicKey,
        tokenProgram: tokenProgram!,
        randomAccountAsId: seed
      })
      .instruction()

    // const decimal = await this.getTokenDecimals(tokenAddressPubKey.toBase58())

    const fromUserTokenAccount = getAssociatedTokenAddressSync(
      new PublicKey(pool.quoteCurrency.address),
      this._walletPublicKey,
      false,
      quoteTokenProgram
    )
    const platformTokenAccount = getAssociatedTokenAddressSync(
      new PublicKey(pool.quoteCurrency.address),
      new PublicKey(FEE_RECIPIENT),
      false,
      quoteTokenProgram
    )

    const repaySolIx = await this.program.methods
      .tradingCloseRepaySol(new BN(sellInfo.quoteResponse.outAmount), new BN(9998))
      .accountsStrict({
        nodeWallet: pool.nodeWallet.publicKey,
        positionAccount: positionAccountPDA,
        tradingPool: poolKey,
        trader: this._walletPublicKey,
        systemProgram: web3.SystemProgram.programId,
        clock: web3.SYSVAR_CLOCK_PUBKEY,
        randomAccountAsId: seed,
        feeTokenAccount: getAssociatedTokenAddressSync(
          new PublicKey(pool.quoteCurrency.address),
          new PublicKey("6JfTobDvwuwZxZP6FR5JPmjdvQ4h4MovkEVH2FPsMSrF"),
          false,
          quoteTokenProgram
        ),
        tokenProgram: quoteTokenProgram!,
        fromTokenAccount: fromUserTokenAccount,
        toTokenAccount: getAssociatedTokenAddressSync(
          new PublicKey(pool.quoteCurrency.address),
          new PublicKey(pool.nodeWallet.publicKey),
          true,
          quoteTokenProgram
        ),
        mint: pool.quoteCurrency.address
      })
      .remainingAccounts([
        {
          pubkey: platformTokenAccount,
          isSigner: false,
          isWritable: true
        }
      ])
      .instruction()

    let profitFeeIx: web3.TransactionInstruction | null = null

    // if (pnl > 0) {
    //   profitFeeIx = createTransferInstruction(
    //     fromUserTokenAccount,
    //     platformTokenAccount, // Destination token account
    //     this._walletPublicKey, // Authority to sign the transaction
    //     new BN(pnl).mul(new BN(PROFIT_FEE)).div(new BN(100)).toNumber(), // Amount to transfer (in smallest units)
    //     [], // Multi-signature signers (optional)
    //     TOKEN_PROGRAM_ID // SPL Token program ID
    //   )
    // }

    const allInstructions = [
      tokenLedgerInstruction ? deserializeInstruction(tokenLedgerInstruction) : null,
      toTokenAccount.instruction,
      closePositionIx,
      ...jupiterIxs,
      repaySolIx,
      ...(profitFeeIx ? [profitFeeIx] : [])
    ].filter((i) => i)

    const messageV0 = new TransactionMessage({
      payerKey: this._walletPublicKey,
      recentBlockhash: blockhash,
      instructions: allInstructions as TransactionInstruction[]
    }).compileToV0Message(addressLookupTableAccounts)
    //
    // const tx = new VersionedTransaction(messageV0)
    // const transactionSimulation = await this.program.provider.connection.simulateTransaction(tx, {
    //   replaceRecentBlockhash: true
    // })
    // const transactionLogs = transactionSimulation.value.logs
    // console.log(transactionLogs)

    return new VersionedTransaction(messageV0)
  }

  async accruedInterest(poolKey: string, positionAccount: string, seed: PublicKey) {
    const [poolKeyPubKey, positionAccountPubKey] = [new PublicKey(poolKey), new PublicKey(positionAccount)]

    const { quoteCurrency, nodeWallet } = await this.poolService.getPoolByKey(poolKey)

    const ix = await this.program.methods
      .tradingDataAccruedInterest()
      .accountsStrict({
        positionAccount: positionAccountPubKey,
        trader: this._walletPublicKey as PublicKey,
        tradingPool: poolKeyPubKey,
        nodeWallet: nodeWallet as any,
        clock: web3.SYSVAR_CLOCK_PUBKEY,
        systemProgram: web3.SystemProgram.programId,
        randomAccountAsId: seed,
        feeTokenAccount: getAssociatedTokenAddressSync(
          new PublicKey(quoteCurrency.address),
          new PublicKey("6JfTobDvwuwZxZP6FR5JPmjdvQ4h4MovkEVH2FPsMSrF")
        ),
        tokenProgram: TOKEN_PROGRAM_ID,
        fromTokenAccount: getAssociatedTokenAddressSync(
          new PublicKey(quoteCurrency.address),
          this._walletPublicKey as PublicKey
        ),
        toTokenAccount: getAssociatedTokenAddressSync(
          new PublicKey(quoteCurrency.address),
          new PublicKey(nodeWallet.publicKey),
          true
        ),
        mint: quoteCurrency.address
      })
      .instruction()

    const data = await this.program.provider.connection.getLatestBlockhash()

    const msg = new TransactionMessage({
      payerKey: this._walletPublicKey as PublicKey,
      recentBlockhash: data.blockhash,
      instructions: [ix]
    }).compileToV0Message()

    const tx = new VersionedTransaction(msg)

    const transactionSimulation = await this.program.provider.connection.simulateTransaction(tx)

    const transactionLogs = transactionSimulation.value.logs

    const returnPrefix = `Program return: ${this.program.programId} `
    const returnLogEntry = transactionLogs?.find((log) => log.startsWith(returnPrefix))

    if (returnLogEntry) {
      const encodedReturnData = returnLogEntry.slice(returnPrefix.length)
      const decodedBuffer = Buffer.from(encodedReturnData, "base64")
      const dataView = new DataView(decodedBuffer.buffer, decodedBuffer.byteOffset, decodedBuffer.byteLength)
      if (typeof dataView.getBigInt64 === "function") {
        const number = Number(dataView.getBigInt64(0, true))
        return number
      } else {
        const number = Number(dataView.getFloat64(0))
        return number
      }
    }
  }

  async createTakeProfit(price: BigNumber, poolKey: string, seed: PublicKey) {
    if (!this._walletPublicKey) {
      throw new Error("Provider public key is not set")
    }

    const pool = await this.poolService.getPoolByKey(poolKey)
    const poolPubKey = new PublicKey(poolKey)
    const { blockhash } = await this.program.provider.connection.getLatestBlockhash("finalized")
    const positionAccountPDA = getPda(
      [Buffer.from("position"), this._walletPublicKey?.toBuffer(), poolPubKey.toBuffer(), seed.toBuffer()],
      this.program.programId.toBase58()
    )
    const delegatePDA = getPda([Buffer.from("delegate"), positionAccountPDA.toBuffer()], this.program.programId.toBase58())
    const delegateOperator = new PublicKey(DELEGATE_OPERATOR_ADDRESS)
    const quoteDecimal = await this.getTokenDecimals(pool.quoteCurrency.address)

    const { priceBN, lowerThresholdBN } = this.calculateTakeProfitThresholds(price, quoteDecimal)

    const createTpIx = await this.program.methods
      .tradingCreateTpDelegate(new BN(priceBN), new BN(lowerThresholdBN), delegateOperator, new BN(100))
      .accountsStrict({
        delegate: delegatePDA,
        originalOperator: this._walletPublicKey,
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
      payerKey: this._walletPublicKey,
      recentBlockhash: blockhash,
      instructions: [createTpIx].filter(Boolean)
    }).compileToV0Message()
    const versionedTx = new VersionedTransaction(messageV0)

    return versionedTx
  }

  async removeTakeProfit(poolKey: string, seed: PublicKey) {
    if (!this._walletPublicKey) {
      throw new Error("Provider public key is not set")
    }

    // const pool = await this.poolService.getPoolByKey(poolKey)
    const poolPubKey = new PublicKey(poolKey)
    const { blockhash } = await this.program.provider.connection.getLatestBlockhash("finalized")
    const positionAccountPDA = getPda(
      [Buffer.from("position"), this._walletPublicKey?.toBuffer(), poolPubKey.toBuffer(), seed.toBuffer()],
      this.program.programId.toBase58()
    )
    const delegatePDA = getPda([Buffer.from("delegate"), positionAccountPDA.toBuffer()], this.program.programId.toBase58())

    const removeTpIx = await this.program.methods
      .tradingRemoveTpDelegate()
      .accountsStrict({
        delegate: delegatePDA,
        originalOperator: this._walletPublicKey,
        delegatedAccount: positionAccountPDA,
        systemProgram: web3.SystemProgram.programId
      })
      .instruction()

    const messageV0 = new TransactionMessage({
      payerKey: this._walletPublicKey,
      recentBlockhash: blockhash,
      instructions: [removeTpIx].filter(Boolean)
    }).compileToV0Message()
    const versionedTx = new VersionedTransaction(messageV0)

    return versionedTx
  }

  async modifyTakeProfit(price: BigNumber, poolKey: string, seed: PublicKey) {
    if (!this._walletPublicKey) {
      throw new Error("Provider public key is not set")
    }

    const pool = await this.poolService.getPoolByKey(poolKey)
    const poolPubKey = new PublicKey(poolKey)
    const { blockhash } = await this.program.provider.connection.getLatestBlockhash("finalized")
    const positionAccountPDA = getPda(
      [Buffer.from("position"), this._walletPublicKey?.toBuffer(), poolPubKey.toBuffer(), seed.toBuffer()],
      this.program.programId.toBase58()
    )
    const delegatePDA = getPda([Buffer.from("delegate"), positionAccountPDA.toBuffer()], this.program.programId.toBase58())
    const delegateOperator = new PublicKey(DELEGATE_OPERATOR_ADDRESS)
    const quoteDecimal = await this.getTokenDecimals(pool.quoteCurrency.address)

    const { priceBN, lowerThresholdBN } = this.calculateTakeProfitThresholds(price, quoteDecimal)

    const removeTpIx = await this.program.methods
      .tradingRemoveTpDelegate()
      .accountsStrict({
        delegate: delegatePDA,
        originalOperator: this._walletPublicKey,
        delegatedAccount: positionAccountPDA,
        systemProgram: web3.SystemProgram.programId
      })
      .instruction()

    const createTpIx = await this.program.methods
      .tradingCreateTpDelegate(new BN(priceBN), new BN(lowerThresholdBN), delegateOperator, new BN(100))
      .accountsStrict({
        delegate: delegatePDA,
        originalOperator: this._walletPublicKey,
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
      payerKey: this._walletPublicKey,
      recentBlockhash: blockhash,
      instructions: [removeTpIx, createTpIx].filter(Boolean)
    }).compileToV0Message()
    const versionedTx = new VersionedTransaction(messageV0)

    return versionedTx
  }

  async getTakeProfit(positionKey: string) {
    const delegates = await this.program.account.delegate.all()

    const delegate = delegates.filter((d) => d.account.account?.toString() === positionKey)

    return delegate?.[0]?.account?.field1?.toString()
  }

  calculateTakeProfitThresholds(price: BigNumber, quoteDecimal: number) {
    const priceBN = new BN(
      new BigNumber(price).multipliedBy(BigNumber(10).pow(quoteDecimal)).integerValue(BigNumber.ROUND_FLOOR).toString()
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
