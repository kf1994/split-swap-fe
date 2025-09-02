import BigNumber from "bignumber.js"
import { EnRewardType } from "@config"
import { PublicKey, TransactionInstruction } from "@solana/web3.js"
import { TokenInfo } from "./token.types"

export type NodeWallet = {
    liquidationLTV: number
    maintenanceLTV: number
    nodeOperator: string
    publicKey: string
    totalBorrowed: BigNumber
    totalFunds: BigNumber
}

export type Pool = {
    apr: BigNumber
    baseCurrency: {
        address: string
        logoURI?: string
        symbol: string
        decimals?: number
    }
    currentExposure: BigNumber
    maxBorrow: BigNumber
    maxExposure: BigNumber
    interestRate?: number
    nodeWallet: {
        liquidationLTV: number
        maintenanceLTV: number
        nodeOperator: string
        publicKey: string
        totalBorrowed: BigNumber
        totalFunds: BigNumber
    }
    publicKey: string
    programId: string
    quoteCurrency: {
        address: string
        symbol: string
        decimals?: number
    }
}

export type Position = {
    borrowedAmount: BigNumber
    closeDate?: Date
    collateralSize: BigNumber
    durationDays: number
    entryPrice: BigNumber
    initialLeverage: BigNumber
    initialMargin: BigNumber
    initialPositionSize: BigNumber
    interestAccrued: BigNumber
    interestRate: BigNumber
    openDate: Date
    pnl?: BigNumber
    pool: Pool
    openTimestamp: number
    closeTimestamp: number
    positionSize: BigNumber
    price: BigNumber
    publicKey: string
    roi?: BigNumber
    seed: string
    state: string
    status: string
    updatedAt?: Date
    userAddress: string
    uuid?: string
    processedData?: {
        token: TokenInfo | undefined
        currentPrice: number
        liquidationPrice: number
        currentLTV: BigNumber
        positionPnl: number | undefined
        positionRoi: number | undefined
        priceChangePercentage: BigNumber
        closingChangePercentage: BigNumber
        averageDailyInterest: BigNumber
        startDate: string
        closeDate: string | undefined
        quoteSymbol: string
        collateralPrice: number | undefined
        realPnL: number
        quotePriceInUSD: number
        finalRoi: BigNumber
        roi: BigNumber
        sellFromPosition: number
    }
}

export type Price = {
    id: string
    mintSymbol: string
    vsToken: string
    vsTokenSymbol: string
    price: number
}

export type Referee = {
    code?: string
    createdAt?: Date
    wallet: string
    updatedAt?: Date
    isFinalized: boolean
}

export type ReferralCode = {
    code: string
    createdAt?: Date
    link: string
    referees?: Referee[]
    wallet?: string
}

export type Token = {
    address: string
    dailyVolume?: number
    decimals: number
    freezeAuthority?: string
    logoURI: string | null
    mintAuthority?: string
    name: string
    symbol: string
    tags: string[]
    whitelisted?: boolean
}

export interface IPriceResponse {
    data: Record<string, IJupiterPriceData>
    timeTaken: number
}

export interface IJupiterPriceData {
    id: string
    mintSymbol: string
    vsToken: string
    vsTokenSymbol: string
    price: number
}

export interface IBirdEyeResponse {
    data: Record<string, IBirdEyePriceData>
}

export interface IBirdEyePriceData {
    id: string
    type: string
    price: string | number
}
export interface IProsHistory {
    createdAt: string
    updatedAt: string
    uuid: string
    type: EnRewardType
    pros: number
}

export interface IReferrals {
    uuid: string
    address: string
    createdAt: string
    totalPositions: string
    profitSum: string
    paid: string
    volume: string
}

export interface IOverallStats {
    totalUsers: number
    totalPositions: string
    totalProfit: string
    totalVolume: string
    totalPaid: string
}

export interface IATAAccount {
    account: { address: PublicKey } | null
    instruction: TransactionInstruction | null
}

export interface IUserInfo {
    uuid: string
    nickname?: string
    isOg: boolean
    address: string
    referralCode: string
    pros: number
    profileImage?: string
    solBalance: number
    usdBalance: number
    spotPnl: number
    childWallets: Array<ChildWalletType>
    pnl: {
        sol: number
        usdc: number
    }
    twitter: string | null
    telegram: string | null
    loading?: boolean
    watchlist: Array<string>
    twoFaVerified: boolean
    blocked: boolean
}
export type ChildWalletType = {
    createdAt: string
    updatedAt: string
    name: string
    uuid: string
    address: string
    pros: string
    volume: string
    totalPositions: string
    profitSum: string
    paid: string
    referralCode: string
    isCommunityUser: boolean
    profitSharePercentage: number
    profileImage: null | string
    twitter: null | string
    telegram: null | string
    isOg: boolean
    solBalance: number
    privyWallet: PrivyWallet
    usdBalance: number
    icon?: string
}
type PrivyWallet = {
    createdAt: string
    updatedAt: string
    uuid: string
    privyId: any
    address: string
    delegated: boolean
}
export interface IUploadUserImage {
    key: string
    signed_url: string
}

export interface IUpdateUserInfo {
    createdAt: string
    updatedAt: string
    uuid: string
    address: string
    pros: string
    volume: string
    totalPositions: string
    profitSum: string
    paid: string
    referralCode: string
    isCommunityUser: boolean
    profitSharePercentage: number
    profileImage: string
    twitter?: string
    telegram?: string
}

export type IMeta = {
    totalItems: number
    itemCount: number
    itemsPerPage: number
    totalPages: number
    currentPage: number
}

export type WalletTransactionHistory = {
    items: walletTransaction[]
    meta: IMeta
}
export type walletTransaction = {
    type: string
    address: string
    amount: string
    txHash: string
    status: TransactionStatus
    createdAt: string
}

export enum TransactionStatus {
    SUCCESS = "success"
}

export type IFetchChildWallet = ChildWallet[]
export type ChildWallet = {
    createdAt: string
    updatedAt: string
    usdBalance: number
    uuid: string
    address: string
    pros: string
    volume: string
    totalPositions: string
    profitSum: string
    paid: string
    referralCode: string
    isCommunityUser: boolean
    profitSharePercentage: number
    profileImage: null | string
    twitter: null | string
    telegram: null | string
    isOg: boolean
    tokenCount: string
    solBalance: string
}

export interface ITrackWalletsList {
    createdAt: string
    updatedAt: string
    uuid: string
    address: string
    name: string
}

export interface IDeleteTrackWallet {
    affected: number
    raw: Array<Record<string, string>>
}
