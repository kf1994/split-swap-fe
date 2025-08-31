import { create } from "zustand"
import { devtools, persist } from "zustand/middleware"
import {TokenInterface} from "@types";

interface IUserProps {
  loading: boolean
  isAuthenticated: boolean
  setAuthentication: (isAuthenticated: boolean) => void
  reset: () => void // Add a reset function
    selectedTokens:string[]
    setSelectedTokens:(values: string[]) => void
    selectedToken:TokenInterface | undefined
    setSelectedToken:(value: TokenInterface) => void
    currentState: "1" | "2"
    setCurrentState: (state: "1" | "2") => void
}

export const userProfileStore = create<IUserProps>()(
  devtools(
    persist(
      (set) => ({
        loading: false,
        isAuthenticated: false,
          selectedTokens:[],
          selectedToken:undefined,
          currentState:"1",
        setAuthentication: (isAuthenticated: boolean) =>
          set({ isAuthenticated }),
        setLoading: (loading: boolean) => set({ loading }),
        setSelectedTokens: (selectedTokens: string[]) => set({ selectedTokens }),
          setSelectedToken: (selectedToken: TokenInterface) => set({ selectedToken }),
          setCurrentState: (currentState: "1" | "2") => set({ currentState }),
        reset: () =>
          set({
            isAuthenticated: false,
            loading: false
          })
      }),
      { name: "user-profile-storage" }
    )
  )
)
