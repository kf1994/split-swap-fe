"use client"
import { CustomButton } from "@atoms"
import { useWalletModal } from "@solana/wallet-adapter-react-ui"
import { clsxm } from "@utils"

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

interface ActionMainButtonProps {
  actionLabel?: string
  actionMainButtonMode: ActionMainButtonMode
  loading: boolean
  borrow?: () => void
  swap?: () => void
  withdraw?: () => void
  className?: string
  labelClassName?: string
}

export const ActionMainButton = ({
  actionLabel,
  actionMainButtonMode,
  loading,
  borrow,
  swap,
  withdraw,
  className,
  labelClassName
}: ActionMainButtonProps) => {
  const { setVisible } = useWalletModal()

  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  function getLabelByMode(mode: ActionMainButtonMode) {
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

  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  function getColorByMode(mode: ActionMainButtonMode) {
    console.log("MODE==>", mode)
    switch (mode) {
      case "swap":
      case "withdraw":
      case "connect-wallet":
        return "linear-blue"
      case "no-connection":
      case "confirming":
      case "restricted":
      case "enter-amount":
      case "not-whitelisted":
      case "insufficient-funds":
        return "purple-light"
      case "no-liquidity":
        return "gray-bold"
      default:
        return "linear-blue"
    }
  }

  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  function getClickHandlerByMode(mode: ActionMainButtonMode) {
    switch (mode) {
      case "swap": {
        swap?.()
        return
      }
      case "withdraw": {
        withdraw?.()
        return
      }
      case "connect-wallet": {
        setVisible(true)
        return
      }
      default:
        return null
    }
  }

  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  function isDisabledByMode(mode: ActionMainButtonMode, loading: boolean) {
    switch (mode) {
      case "no-connection":
      case "restricted":
      case "enter-amount":
      case "insufficient-funds":
      case "not-whitelisted":
      case "swap":
      case "withdraw":
        return loading
      default:
        return false
    }
  }

  return (
    <CustomButton
      className={clsxm(className)}
      variant={getColorByMode(actionMainButtonMode)}
      disabled={isDisabledByMode(actionMainButtonMode, loading)}
      onClick={() => getClickHandlerByMode(actionMainButtonMode)}
      loading={loading}
      labelClassName={labelClassName}
      // icon={<PoweroffOutlined style={{ color: "#70ED7E" }} />}
    >
      {getLabelByMode(actionMainButtonMode)}
    </CustomButton>
  )
}
