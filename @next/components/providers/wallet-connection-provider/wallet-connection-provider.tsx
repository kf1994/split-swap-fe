// "use client"
//
// import {
//   type LoginModalOptions,
//   useLogin,
//   usePrivy,
//   type User,
//   useSolanaWallets
// } from "@privy-io/react-auth"
// import { notificationService, userProfileService } from "@services"
// import { notificationDataStore, userProfileStore } from "@store"
// import { WalletType } from "@types"
// import { type ReactNode } from "react"
// import type React from "react"
// import { createContext, useContext, useState } from "react"
// import { useShallow } from "zustand/react/shallow"
// // import { WalletCookieModal } from "@atoms"
//
// interface ModalContextType {
//   isModalOpen: boolean
//   login: (options?: LoginModalOptions | React.MouseEvent<any, any>) => void
// }
//
// const WalletConnectionContext = createContext<ModalContextType | undefined>(
//   undefined
// )
//
// export const useWalletConnection = () => {
//   const context = useContext(WalletConnectionContext)
//   if (!context) throw new Error("useModal must be used within ModalProvider")
//   return context
// }
//
// export const WalletConnectionProvider = ({
//   children
// }: {
//   children: ReactNode
// }) => {
//   const { isModalOpen, logout, getAccessToken } = usePrivy()
//   const { wallets } = useSolanaWallets()
//   const { login: privyLogin } = useLogin({
//     onComplete: async (data) => {
//       if (data?.user) {
//         accessTokenOperations(data?.user)
//       }
//     },
//     onError: (error) => {
//       console.error("Login failed", error)
//     }
//   })
//
//   // const { login } = useLogin({
//   //   onComplete: async (data) => {
//   //     accessTokenOperations(data?.user)
//   //   },
//   //   onError: (error) => {
//   //     console.error("Login failed", error)
//   //   }
//   // })
//
//   const referralCode = localStorage.getItem("promoCode") ?? "maxbid"
//   const [showTermsModal, setShowTermsModal] = useState(false)
//
//   const [isAuthenticated, setAuthentication] = userProfileStore(
//     useShallow((s) => [s.isAuthenticated, s.setAuthentication])
//   )
//
//   const [loading, setLoading] = useState(false)
//   const accessTokenOperations = async (user: User) => {
//     if (!referralCode) return
//     setLoading(true)
//     try {
//       const token = await getAccessToken()
//       if (token && user?.wallet?.address) {
//         await userProfileService.setUserInfo({
//           address: user?.wallet?.address,
//           authToken: token,
//           referralCode,
//           message: "asdads",
//           signature: "test message"
//         })
//         authTokenOperations()
//       }
//     } catch (error) {
//       logout()
//     } finally {
//       setLoading(false)
//     }
//   }
//   const authTokenOperations = async () => {
//     setLoading(true)
//     try {
//       const currentUserData = await notificationService.getCurrentUser()
//       const mainWallet = wallets.find(
//         (wallet) =>
//           wallet.walletClientType !== "privy" && wallet.type === "solana"
//       )
//       if (mainWallet) {
//         setMainWallet(mainWallet)
//       }
//       setWalletType(WalletType.REGULAR_WALLET)
//       //   setCurrentUserInfo(currentUserData)
//       setAuthentication(true)
//       setLoading(false)
//     } catch (error) {
//       setLoading(true)
//     }
//   }
//
//   // Wrapper login method that shows custom modal first
//   const login = () => {
//     setShowTermsModal(true)
//   }
//
//   // User accepts terms and we trigger privy login
//   const handleAcceptTerms = () => {
//     setShowTermsModal(false)
//     privyLogin()
//   }
//
//   return (
//     <WalletConnectionContext.Provider value={{ login, isModalOpen }}>
//       {children}
//       {showTermsModal && (
//         <WalletCookieModal
//           onAccept={handleAcceptTerms}
//           onCancel={() => {
//             setShowTermsModal(false)
//           }}
//           showTermsModal={showTermsModal}
//         />
//       )}
//     </WalletConnectionContext.Provider>
//   )
// }
