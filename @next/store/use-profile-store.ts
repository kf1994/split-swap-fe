import { create } from "zustand"
import { devtools, persist } from "zustand/middleware"

interface IUserProps {
  loading: boolean
  isAuthenticated: boolean
  setAuthentication: (isAuthenticated: boolean) => void
  reset: () => void // Add a reset function
}

export const userProfileStore = create<IUserProps>()(
  devtools(
    persist(
      (set) => ({
        loading: false,
        isAuthenticated: false,
        setAuthentication: (isAuthenticated: boolean) =>
          set({ isAuthenticated }),
        setLoading: (loading: boolean) => set({ loading }),

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
