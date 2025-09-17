// Declaring this interface provides type safety for message keys
// eslint-disable-next-line @typescript-eslint/consistent-type-imports
type Messages = typeof import("@/locale/messages/en-US.json")

declare interface IntlMessages extends Messages {}

interface Window {
  phantom?: any
  solflare?: any
  okxwallet?: any
  dataLayer?: any
}
