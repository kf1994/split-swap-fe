/* eslint-disable @typescript-eslint/explicit-function-return-type */
"use client"

import { CustomButton } from "./custom-button"

export type ActionMainButtonMode =
  | "connect-wallet"
  | "no-connection"
  | "restricted"
  | "confirming"
  | "enter-amount"
  | "insufficient-funds"
  | "no-liquidity"
  | "swap"
  | "withdraw"
  | "not-whitelisted"

interface ActionButtonProps {
  actionLabel?: string
  actionMainButtonMode: string
  loading: boolean
  swap?: () => void
  className?: string
}

export const ActionButton = ({
  actionLabel,
  actionMainButtonMode,
  loading,
  swap,
  className
}: ActionButtonProps) => {
  function getLabelByMode(mode: string) {
    switch (mode) {
      case "connect-wallet":
        return "Connect wallet"
      case "no-connection":
        return "No connection"
      case "confirming":
        return "Confirming"
      case "restricted":
        return "Restricted"
      case "enter-amount":
        return "Enter amount"
      case "insufficient-funds":
        return "Insufficient funds"

      case "swap":
        return actionLabel ?? "Swap"
      case "withdraw":
        return "SEND"
      default:
        return "Restricted"
    }
  }

  function getClickHandlerByMode(mode: string) {
    switch (mode) {
      case "swap": {
        swap?.()
        return
      }

      default:
        return null
    }
  }

  function isDisabledByMode(mode: string, loading: boolean) {
    switch (mode) {
      case "no-connection":
      case "restricted":
      case "enter-amount":
      case "insufficient-funds":
      case "not-whitelisted":
        //   case "swap":
        return true
      default:
        return false
    }
  }

  return (
    <CustomButton
      disabled={isDisabledByMode(actionMainButtonMode, loading)}
      onClick={() => getClickHandlerByMode(actionMainButtonMode)}
      className={className}
      // icon={<PoweroffOutlined style={{ color: "#70ED7E" }} />}
    >
      {getLabelByMode(actionMainButtonMode)}
    </CustomButton>
  )
}
