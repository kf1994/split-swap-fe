"use client"

import type React from "react"
import { type PropsWithChildren, useEffect, useState } from "react"
import { type ThemeMode } from "antd-style/es"
import { ThemeProvider as AntDStyleThemeProvider } from "antd-style"
import { getAntdTheme } from "../../../src/styles"
import { App } from "antd"

import ReactGA from "react-ga4"
ReactGA.initialize("G-401788GVCP")

export type ProviderProps = PropsWithChildren<{
  locale?: string
  appearance?: ThemeMode
}>

export const ThemeProvider: React.FC<ProviderProps> = ({
  locale,
  children
}) => {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    // use your loading page
    return <div className="hidden"></div>
  }
  return (
    <AntDStyleThemeProvider theme={getAntdTheme} defaultThemeMode={"light"}>
      <App>{children}</App>
    </AntDStyleThemeProvider>
  )
}
