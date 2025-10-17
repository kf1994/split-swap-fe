"use client"

import { useEffect, useRef } from "react"
import {
  toast,
  type ToastOptions,
  type ToastContent,
  type Id
} from "react-toastify"
import { useAlertStore } from "@store"

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export const ToastNotifier = () => {
  const { step, txHash } = useAlertStore()
  const toastId = useRef<Id | null>(null)

  useEffect(() => {
    if (!step || step === "idle") return

    let content: ToastContent
    let options: ToastOptions = {
      autoClose: false, // stays visible until completed/failed
      closeOnClick: false,
      draggable: false,
      isLoading: false
    }

    switch (step) {
      case "creatingAccount":
        content = "🔍 Creating balance account..."
        options.type = "info"
        break

      case "checkingBalance":
        content = "🔍 Checking user balance..."
        options.type = "info"
        break

      case "depositing":
        content = "💰 Depositing tokens..."
        options.type = "info"
        break

      case "waitingBalance":
        content = "⏳ Waiting for balance update..."
        options.type = "info"
        break

      case "placingTrade":
        content = "📈 Placing trade..."
        options.type = "info"
        break
      case "preparingWithdraw":
        content = "📈 Preparing for withdraw..."
        options.type = "info"
        break
      case "creatingWithdrawalState":
        content = "📈 creating withdrawal state..."
        options.type = "info"
        break

      case "placingWithdrawal":
        content = "📈 placing withdrawal..."
        options.type = "info"
        break
      case "completed":
        content = txHash ? (
          <a
            href={`https://solscan.io/tx/${txHash}`}
            target="_blank"
            rel="noreferrer"
            className="underline"
          >
            ✅ Trade Completed — View on Explorer
          </a>
        ) : (
          "✅ Trade Completed"
        )
        options.type = "success"
        options.autoClose = 5000
        break

      case "failed":
        content = "❌ Swap failed. Please try again."
        options.type = "error"
        options.autoClose = 5000
        break

      default:
        return
    }

    // Create or update the single toast
    if (!toastId.current) {
      toastId.current = toast(content, options)
    } else {
      toast.update(toastId.current, {
        render: content,
        type: options.type,
        isLoading: step !== "completed" && step !== "failed",
        autoClose: options.autoClose
      })

      // Reset toast ID if finished
      if (step === "completed" || step === "failed") {
        setTimeout(() => {
          toastId.current = null
        }, 5000)
      }
    }
  }, [step, txHash])

  return null
}
