// app/layout.tsx
import "../styles/globals.css"
import "react-modern-drawer/dist/index.css"
import type { Metadata } from "next"
import { MainLayout } from "@layouts"
import type React from "react"
import { RootProviders, WindowProvider } from "../../@next/components/providers"
import { ToastContainer } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"
import { ToastNotifier } from "@atoms"
interface RootLayoutProps {
  children: React.ReactNode
  params: Record<string, any>
}

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const RootLayout = async ({ children }: RootLayoutProps) => {
  return (
    <html lang="en">
      <body>
        <WindowProvider>
          <RootProviders>
            <main
              className="main-bg"
              style={{ minWidth: 375, minHeight: "100vh" }}
            >
              <MainLayout>{children}</MainLayout>
            </main>
          </RootProviders>
          <ToastNotifier />
          <ToastContainer position="bottom-right" autoClose={4000} />
        </WindowProvider>
      </body>
    </html>
  )
}

export const metadata: Metadata = {
  title: "Split Swap",
  description: "Split Swap",
  icons: {
    icon: "/fav.gif"
  },
  openGraph: {
    title: "Split Swap",
    description: "Split Swap",
    url: "",
    type: "website"
  }
}

export default RootLayout
