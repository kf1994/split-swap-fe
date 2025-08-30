// app/layout.tsx
import "../styles/globals.css"
import 'react-modern-drawer/dist/index.css'

import { Poppins, Krub } from "next/font/google"
import type { Metadata } from "next"
import { MainLayout } from "@layouts"
import { ThemeProvider } from "next-themes"
import type React from "react"

const poppins = Poppins({ subsets: ["latin"], weight: "400" })
// const krub = Krub({ subsets: ["latin"], weight: "400" })

interface RootLayoutProps {
  children: React.ReactNode
  params: Record<string, any>
}

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const RootLayout = async ({ children }: RootLayoutProps) => {
  return (
    <html lang="en">
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <main
            className="main-bg"
            style={{ minWidth: 375, minHeight: "100vh" }}
          >
            <MainLayout>{children}</MainLayout>
          </main>
        </ThemeProvider>
      </body>
    </html>
  )
}

export const metadata: Metadata = {
  title: "",
  description: "",
  icons: {
    icon: "/"
  },
  openGraph: {
    title: "",
    description: "",
    url: "",
    siteName: "$",
    type: "website"
  }
}

export default RootLayout
