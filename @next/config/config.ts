export const PROGRAM_ID = "65XsnGdUuwcSb6CA6JpiP1dJUxcTTmVVsqesG4nA7YoP"
export const MAGIC_BLOCK_RPC = "https://tap-trading.magicblock.app"
export const SOLANA_RPC = "https://rpc.maxbid.pro"
export const SOLANA_RPC_FALLBACK =
  "https://solana-mainnet.g.alchemy.com/v2/qZuycwS2f70uco60wZTbnluiw5PW3xJd"
export const SOL_ADDRESS = "So11111111111111111111111111111111111111112"
export const USDC_ADDRESS = "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v"
export const SOL_LOGO_URI = "/images/sol-logo.svg"
export const PROFIT_FEE = 0 // 5%
export const DELEGATE_OPERATOR = "5o81q21qgQorNUZA8apWx4mzsF8jkhMKkLw1tzc7fPtt"

export const ENABLE_REACT_QUERY_DEVTOOLS =
  process.env.NEXT_PUBLIC_ENABLE_REACT_QUERY_DEVTOOLS === "true"

export const TRENDING_TOKENS_API = process.env.NEXT_PUBLIC_TRENDING_TOKENS_API

export const FEE_RECIPIENT = process.env.NEXT_PUBLIC_FEE_RECIPIENT

export const JUP_REFERRAL_KEY = process.env.NEXT_PUBLIC_JUP_REFERRAL_KEY

export const JUP_SWAP_REFERRAL_KEY =
  process.env.NEXT_PUBLIC_JUP_SWAP_REFERRAL_KEY

export const API_HOST = process.env.NEXT_PUBLIC_API_HOST ?? "/"

// export const CHART_API = process.env.NEXT_PUBLIC_CHART_API

export const HOMEPAGE_REGEX =
  /^\/(?:(?:[a-z]{2}-[A-Z]{2})\/)?@[^\/]+\/?$|^\/(?:[a-z]{2}-[A-Z]{2})?\/?$/

export const PRIVY_APP_ID = process.env.NEXT_PUBLIC_PRIVY_APP_ID
export const PRIVY_CLIENT_ID = process.env.NEXT_PUBLIC_PRIVY_CLIENT_ID
export const BASE_58_REGEX = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/

export const MARKET_PRICE_REFRESH_INTERVAL = 5_000
export const USDC_LOGO_URI =
  "https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v/logo.png"

// export const WEBHOOKS_WS_URL = process.env.NEXT_PUBLIC_WEBHOOKS_WS_URL

export const BACKEND_WS_URL = process.env.NEXT_PUBLIC_BACKEND_WS_URL

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

export const SOLSCAN_URL = "https://solscan.io/"

export const QUOTE_TOKENS = [USDC_TOKEN, SOL_TOKEN]
export const WIF_TOKEN = {
  createdAt: "2024-10-21T08:46:32.023Z",
  updatedAt: "2025-01-06T13:22:41.519Z",
  uuid: "391ae852-37c6-413d-ac39-ffebf163c35c",
  address: "9BB6NFEcjBCtnNLFko2FqVQBq8HHM13kCyYcdQbgpump",
  name: "Fartcoin",
  symbol: "Fartcoin",
  dailyVolume: "2286772.6657127007",
  decimals: 6,
  freezeAuthority: false,
  logoURI:
    "https://maxbid-public.s3.us-east-1.amazonaws.com/2025-01-06T13:22:41.447Z_fartcoin.png",
  mintAuthority: false,
  whitelisted: true,
  swapEnabled: true,
  verified: true,
  tags: ["unknown"],
  creationTime: 1729231505,
  mintTime: 1729231505,
  creationTx:
    "4x9KdECQzU8cuRjoa3SZch2aqK3PiSYKYAomPmQrYSFgwbnKeN2LV64VPAy46Xezm21oZSg7pPJHC7YS4hGVqz9S",
  creatorAddress: "HyYNVYmnFmi87NsQqWzLJhUTPBKQUfgfhdbBa554nMFF"
}

export const DELEGATE_OPERATOR_ADDRESS =
  "6dA5GTDPWxnw3gvjoy3vYBDyY7iETxcTJzt8RqF9i9MV"
export const LOWER_THRESHOLD_PERCENT = 5

export const DEFAULT_MIN = {
  SOL: 0.05,
  USDC: 10
}
export const MIN_LOAN_LIMIT = DEFAULT_MIN
export const MIN_REMAINING_LOAN_BALANCE = DEFAULT_MIN
export const MIN_TRANSACTION_AMOUNT = DEFAULT_MIN

export type QuoteTokenSymbol = "SOL" | "USDC"

export const MIN_TAKE_PROFIT_PERCENT = 10
export const SLIPPAGE_PERCENT = 5

export const TELEGRAM_CHANNEL = "https://t.me/MaxbidNotifierBot"

export const FIAT_CURRENCY = {
  default_exchange_value: "300",
  ticker: "EUR",
  name: "Euro (Euro)",
  network: "EUR",
  block_explorer_url_mask: "null",
  token_contract: null,
  logo_url: "https://guardarian.com/uploads/eur_2fb3ea3cae.svg",
  payment_methods: [
    {
      type: "BANKERA_1",
      payment_method: "BANKERA_1",
      payment_category: "SEPA",
      deposit_enabled: true,
      withdrawal_enabled: false
    },
    {
      type: "VISA_MC5",
      payment_method: "VISA_MC5",
      payment_category: "APPLE_PAY",
      deposit_enabled: true,
      withdrawal_enabled: false
    },
    {
      type: "VISA_MC5",
      payment_method: "VISA_MC5",
      payment_category: "VISA_MC",
      deposit_enabled: true,
      withdrawal_enabled: false
    },
    {
      type: "IVY",
      payment_method: "IVY",
      payment_category: "OPEN_BANKING",
      deposit_enabled: true,
      withdrawal_enabled: false
    },
    {
      type: "VISA_MC6",
      payment_method: "VISA_MC6",
      payment_category: "VISA_MC",
      deposit_enabled: true,
      withdrawal_enabled: false
    },
    {
      type: "VISA_MC4",
      payment_method: "VISA_MC4",
      payment_category: "SEPA",
      deposit_enabled: true,
      withdrawal_enabled: true
    },
    {
      type: "IVY",
      payment_method: "IVY",
      payment_category: "SEPA",
      deposit_enabled: false,
      withdrawal_enabled: true
    },
    {
      type: "VISA_MC5",
      payment_method: "VISA_MC5",
      payment_category: "GOOGLE_PAY",
      deposit_enabled: true,
      withdrawal_enabled: false
    },
    {
      type: "VISA_MC6",
      payment_method: "VISA_MC6",
      payment_category: "REVOLUT_PAY",
      deposit_enabled: true,
      withdrawal_enabled: false
    }
  ],
  enabled_subscription: true,
  network_fee: null
}

export const CRYPTO_CURRENCY_SOL = {
  default_exchange_value: "2.6582669",
  ticker: "SOL",
  name: "Solana (Solana)",
  network: "SOL",
  block_explorer_url_mask: "https://solscan.io/tx/$$",
  token_contract: null,
  logo_url: "https://guardarian.com/uploads/sol_3b3f795997.svg",
  payment_methods: [
    {
      type: "CRYPTO_THROUGH_CN",
      payment_method: "CRYPTO_THROUGH_CN",
      payment_category: "CRYPTO",
      deposit_enabled: true,
      withdrawal_enabled: true
    }
  ],
  enabled_subscription: true,
  network_fee: "0.0005445"
}

export enum EnRewardType {
  POSITION_OPEN = 0,
  POSITION_CLOSE = 1,
  POSITION_PROFITABLE = 2,
  SHARE_ON_X = 3,
  OTHERS = 4,
  SPOT_SWAP = 5
}
