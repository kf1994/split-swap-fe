export const MAGIC_BLOCK_RPC = "https://tap-trading.magicblock.app"
export const SOLANA_RPC = "https://rpc.maxbid.pro"
export const SOLANA_RPC_FALLBACK =
  "https://solana-mainnet.g.alchemy.com/v2/qZuycwS2f70uco60wZTbnluiw5PW3xJd"
export const SOL_ADDRESS = "So11111111111111111111111111111111111111112"
export const USDC_ADDRESS = "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v"
export const SOL_LOGO_URI = "/images/sol-logo.svg"

export const API_HOST = process.env.NEXT_PUBLIC_API_HOST ?? "/"

export const USDC_LOGO_URI =
  "https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v/logo.png"

export const SOL_TOKEN = {
  address: SOL_ADDRESS,
  symbol: "SOL",
  name: "Solana",
  logoURI: SOL_LOGO_URI,
  decimals: 9,
  tags: ["verified"],
  isNewCoin: false,
  isTopTrendingCoins: false,
  whitelistedForAddress: [USDC_ADDRESS],
  dailyInterest: undefined,
  daily_volume: null,
  created_at: "2024-04-26T10:56:58.893768Z",
  extension: {},
  minted_at: null,
  permanent_delegate: null
}

export const USDC_TOKEN = {
  address: USDC_ADDRESS,
  symbol: "USDC",
  name: "USD Coin",
  logoURI: USDC_LOGO_URI,
  decimals: 6,
  tags: ["verified"],
  isTopTrendingCoins: false,
  whitelistedForAddress: [SOL_ADDRESS],
  dailyInterest: undefined,
  dailyVolume: undefined,
  createdAt: "2024-04-26T10:56:58.893768Z",
  extension: {},
  mintedAt: null,
  permanent_delegate: null
}

export enum EnRewardType {
  POSITION_OPEN = 0,
  POSITION_CLOSE = 1,
  POSITION_PROFITABLE = 2,
  SHARE_ON_X = 3,
  OTHERS = 4,
  SPOT_SWAP = 5
}
