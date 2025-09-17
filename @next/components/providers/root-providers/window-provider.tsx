"use client"

import "@solana/wallet-adapter-react-ui/styles.css"
import React from "react"
import type { PropsWithChildren } from "react"

export const WindowProvider: React.FC<PropsWithChildren> = ({ children }) => {
  const [isClient, setIsClient] = React.useState(false)
  React.useEffect(() => {
    setIsClient(true)
  }, [])

  if (!isClient) return null

  return <> {children} </>
}
