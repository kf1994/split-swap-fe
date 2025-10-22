"use client"
import { stringToNumber } from "./string-to-number"
import { type ActionMainButtonMode } from "@atoms"

interface GetActionButtonModeProps {
  isOnline: boolean
  connected: boolean
  confirming: boolean
  solInput: string
  maxAvailableFunds: number
  loading: boolean
  disabled?: boolean
}

export const getActionMainButtonMode = ({
  isOnline,
  connected,
  confirming,
  solInput,
  maxAvailableFunds,
  loading,
  disabled
}: GetActionButtonModeProps): ActionMainButtonMode => {
  const numberAmount = stringToNumber(solInput)
  switch (true) {
    case !isOnline:
      return "no-connection"
    case !connected:
      return "connect-wallet"
    case confirming:
      return "confirming"
    case disabled:
      return "restricted"
    case solInput === "" || stringToNumber(solInput) === 0:
      return "enter-amount"
    case stringToNumber(solInput) > maxAvailableFunds:
      return "insufficient-funds"
    case numberAmount !== 0 && !confirming && !loading:
      return "swap"

    default:
      return "restricted"
  }
}
