import { create } from "zustand"
import { devtools, persist } from "zustand/middleware"
import { TokenInfoInterface, TokenInterface } from "@types"
import { SOL_TOKEN, USDC_TOKEN } from "@config"

interface IUserProps {
  loading: boolean
  isAuthenticated: boolean
  setAuthentication: (isAuthenticated: boolean) => void
  walletAddress: string | undefined
  setWalletAddress: (address: string | undefined) => void
  reset: () => void

  selectedTokens: string[]
  setSelectedTokens: (values: string[]) => void

  swap: {
    from: TokenInfoInterface
    to: TokenInfoInterface
  }
  send: {
    from: TokenInfoInterface
    to: TokenInfoInterface
  }

  setSwapFrom: (value: TokenInfoInterface) => void
  setSwapTo: (value: TokenInfoInterface) => void
  setSendFrom: (value: TokenInfoInterface) => void
  setSendTo: (value: TokenInfoInterface) => void

  // view control
  currentState: "1" | "2"
  setCurrentState: (state: "1" | "2") => void

  // 👇 NEW: tells us what user is selecting
  activeSelector: { section: "swap" | "send"; side: "from" | "to" } | null
  setActiveSelector: (
    selector: { section: "swap" | "send"; side: "from" | "to" } | null
  ) => void
}

export const userProfileStore = create<IUserProps>()(
  devtools(
    persist(
      (set) => ({
        loading: false,
        isAuthenticated: false,
        walletAddress: undefined,
        selectedTokens: [],
        swap: {
          from: SOL_TOKEN,
          to: USDC_TOKEN
        },
        send: {
          from: SOL_TOKEN,
          to: USDC_TOKEN
        },
        currentState: "1",
        activeSelector: null,

        setWalletAddress: (walletAddress: string | undefined) =>
          set({ walletAddress }),
        setAuthentication: (isAuthenticated: boolean) =>
          set({ isAuthenticated }),
        setSelectedTokens: (selectedTokens: string[]) =>
          set({ selectedTokens }),

        setSwapFrom: (from: TokenInfoInterface) =>
          set((state) => ({ swap: { ...state.swap, from } })),
        setSwapTo: (to: TokenInfoInterface) =>
          set((state) => ({ swap: { ...state.swap, to } })),
        setSendFrom: (from: TokenInfoInterface) =>
          set((state) => ({ send: { ...state.send, from } })),
        setSendTo: (to: TokenInfoInterface) =>
          set((state) => ({ send: { ...state.send, to } })),

        setCurrentState: (currentState: "1" | "2") => set({ currentState }),
        setActiveSelector: (activeSelector) => set({ activeSelector }),
        reset: () =>
          set({
            isAuthenticated: false,
            loading: false,
            swap: { from: SOL_TOKEN, to: USDC_TOKEN },
            send: { from: SOL_TOKEN, to: USDC_TOKEN },
            activeSelector: null
          })
      }),
      { name: "user-profile-storage" }
    )
  )
)
