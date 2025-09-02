export interface TokenInterface {
    symbol: string
    name: string
    icon: string
    chain?: string
}

export interface TokenInfo {
    address: string
    decimals: number
    logoURI?: string
    availableLiquidity?: number
    name: string
    symbol: string
    tags: string[]
    whitelisted?: boolean
    isNewCoin?: boolean
    isTopTrendingCoins?: boolean
    isTrendingCoins?: boolean
    score?: number
    isCallChannel?: boolean
    dailyInterest?: number
    creationTime?: number
    type?: string
    createdAt?: string
    marketCap?: number
    price?: number
    liquidity?: number
    uuid?: string
    offers?: Record<string, TokenOffersTypeV2[]>
}

export type TokenOffersTypeV2 = {
    publicKey: string
    programId: string
    apr: number
    maxBorrow: string
    maxExposure: string
    currentExposure: string
    nodeWallet: string
    active: boolean
    quoteToken: string
    collateralToken: string
    priceVsQuote: string
    maxLeverage: number
    maxOpenPerTrade: string
    availableForOpen: string
    tags: any[]
    openLTV: string
    createdAt: string
    updatedAt: number
    targetLtv: number
}

export interface ITrendingCoinsResponse {
    statusCode: number
    message: string
    data: ITrendingCoin[]
}

export interface ITrendingCoin {
    address: string
    score: number
}

export interface TokenInfoInterface {
    address: string
    createdAt?: string
    creationTime?: string
    creationTx?: string
    creatorAddress?: string
    dailyVolume?: number
    decimals: number
    freezeAuthority?: boolean
    logoURI: string
    mintAuthority?: boolean
    name: string
    swapEnabled?: boolean
    symbol: string
    tags?: string[]
    updatedAt?: string
    uuid?: string
    verified?: boolean
    whitelisted?: boolean
}

