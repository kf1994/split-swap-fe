import { create } from "zustand"

type SwapStep =
  | "idle"
  | "checkingBalance"
  | "depositing"
  | "waitingBalance"
  | "placingTrade"
  | "completed"
  | "failed"
  | "creatingAccount"
  | "preparingWithdraw"
  | "creatingWithdrawalState"
  | "placingWithdrawal"

interface AlerState {
  loading: boolean
  step: SwapStep
  txHash: string | null
  setStep: (step: SwapStep, txHash?: string | null) => void
  reset: () => void
}

export const useAlertStore = create<AlerState>((set) => ({
  loading: false,
  step: "idle",
  txHash: null,
  setStep: (step, txHash = null) =>
    // eslint-disable-next-line @typescript-eslint/no-confusing-void-expression
    set({
      step,
      loading: step !== "idle" && step !== "completed" && step !== "failed",
      txHash
    }),
  // eslint-disable-next-line @typescript-eslint/no-confusing-void-expression
  reset: () => set({ loading: false, step: "idle", txHash: null })
}))
