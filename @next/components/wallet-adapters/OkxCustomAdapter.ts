/* eslint-disable */
// @ts-nocheck

import {
  BaseWalletAdapter,
  type EventEmitter,
  type SendTransactionOptions,
  type TransactionOrVersionedTransaction,
  type WalletName,
  WalletReadyState
} from "@solana/wallet-adapter-base"
import {
  type Connection,
  PublicKey,
  type SendOptions,
  type Transaction,
  type TransactionSignature,
  type TransactionVersion,
  type VersionedTransaction
} from "@solana/web3.js"

interface OkxWalletEvents {
  connect: (...args: unknown[]) => unknown
  disconnect: (...args: unknown[]) => unknown
  accountChanged: (newPublicKey: PublicKey) => unknown
}

interface OkxWallet extends EventEmitter<OkxWalletEvents> {
  isPhantom?: boolean
  publicKey?: { toBytes: () => Uint8Array }
  isConnected: boolean
  signTransaction: <T extends Transaction | VersionedTransaction>(transaction: T) => Promise<T>
  signAllTransactions: <T extends Transaction | VersionedTransaction>(transactions: T[]) => Promise<T[]>
  signAndSendTransaction: <T extends Transaction | VersionedTransaction>(
    transaction: T,
    options?: SendOptions
  ) => Promise<{
    signature: TransactionSignature
  }>
  signMessage: (message: Uint8Array) => Promise<{ signature: Uint8Array }>
  connect: () => Promise<void>
  disconnect: () => Promise<void>
}

interface OkxWindow extends Window {
  okxwallet?: {
    solana?: OkxWallet
  }
  solana?: OkxWallet
}

declare const window: OkxWindow

export const OkxWalletName = "OKX Wallet" as WalletName<"OKX Wallet">

export class OkxWalletAdapter extends BaseWalletAdapter {
  name = OkxWalletName
  url = "https://www.okx.com/web3"
  icon =
    "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAYAAABXAvmHAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAJDSURBVHgB7Zq9jtpAEMfHlhEgQLiioXEkoAGECwoKxMcTRHmC5E3IoyRPkPAEkI7unJYmTgEFTYwA8a3NTKScLnCHN6c9r1e3P2llWQy7M/s1Gv1twCP0ej37dDq9x+Zut1t3t9vZjDEHIiSRSPg4ZpDL5fxkMvn1cDh8m0wmfugfO53OoFQq/crn8wxfY9EymQyrVCqMfHvScZx1p9ls3pFxXBy/bKlUipGPrVbLuQqAfsCliq3zl0H84zwtjQrOw4Mt1W63P5LvBm2d+Xz+YzqdgkqUy+WgWCy+Mc/nc282m4FqLBYL+3g8fjDxenq72WxANZbLJeA13zDX67UDioL5ybXwafMYu64Ltn3bdDweQ5R97fd7GyhBQMipx4POeEDHIu2LfDdBIGGz+hJ9CQ1ABjoA2egAZPM6AgiCAEQhsi/C4jHyPA/6/f5NG3Ks2+3CYDC4aTccDrn6ojG54MnEvG00GoVmWLIRNZ7wTCwDHYBsdACy0QHIhiuRETxlICWpMMhGZHmqS8qH6JLyGegAZKMDkI0uKf8X4SWlaZo+Pp1bRrwlJU8ZKLIvUjKh0WiQ3sRUbNVq9c5Ebew7KEo2m/1p4jJ4qAmDaqDQBzj5XyiAT4VCQezJigAU+IDU+z8vJFnGWeC+bKQV/5VZ71FV6L7PA3gg3tXrdQ+DgLhC+75Wq3no69P3MC0NFQpx2lL04Ql9gHK1bRDjsSBIvScBnDTk1WrlGIZBorIDEYJj+rhdgnQ67VmWRe0zlplXl81vcyEt0rSoYDUAAAAASUVORK5CYII="
  supportedTransactionVersions: ReadonlySet<TransactionVersion> = new Set(["legacy", 0])
  standart = true
  wallet: OkxWallet | undefined
  readyState =
    typeof window === "undefined" || typeof document === "undefined"
      ? WalletReadyState.Unsupported
      : WalletReadyState.Loadable
  connecting: boolean
  publicKey: PublicKey

  disconnect(): Promise<void> {
    this.connecting = false
    return this.wallet?.disconnect()
  }

  connect() {
    if (this.wallet) {
      return this.wallet?.connect()
    }
    const dappUrl = window.location.href
    const encodedDappUrl = encodeURIComponent(dappUrl)
    const deepLink = `okx://wallet/dapp/url?dappUrl=${encodedDappUrl}`
    const encodedUrl = `https://www.okx.com/download?deeplink=${encodeURIComponent(deepLink)}`
    const ua = navigator.userAgent
    const isIOS = /iphone|ipad|ipod|ios/i.test(ua)
    const isAndroid = /android|XiaoMi|MiuiBrowser/i.test(ua)
    const isMobile = isIOS || isAndroid
    const isOKApp = /OKApp/i.test(ua)

    if (isMobile && !isOKApp && this.readyState === WalletReadyState.Loadable) {
      window.location.href = encodedUrl
    }

    if (window && window.document && !window.okxwallet) {
      window.open("https://www.okx.com/web3", "_blank")
    }

    return Promise.resolve()
  }

  async sendTransaction(
    transaction: TransactionOrVersionedTransaction<this["supportedTransactionVersions"]>,
    connection: Connection,
    options?: SendTransactionOptions
  ): Promise<string> {
    return this.wallet?.signAndSendTransaction(transaction, options).then(({ signature }) => {
      return signature
    })
  }

  constructor() {
    super()
    this.wallet = window.okxwallet?.solana
    this.connecting = false
    this.publicKey = new PublicKey(0)
    this.name = OkxWalletName

  }
}
