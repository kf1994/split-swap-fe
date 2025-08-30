import { Space_Grotesk, Space_Mono, Inter, Poppins } from "next/font/google"
import React, { type ReactNode } from "react"

const spaceMono = Space_Mono({
  subsets: ["latin"],
  style: ["normal"],
  weight: ["400", "700"]
})

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  style: ["normal"],
  weight: ["400", "700"],
  display: "swap"
})

const inter = Inter({
  subsets: ["latin"],
  style: ["normal"],
  weight: ["400", "700"],
  display: "swap"
})

const poppins = Poppins({
  subsets: ["latin"],
  style: ["normal"],
  weight: ["400", "700"],
  display: "swap"
})

interface Props {
  children: ReactNode
  locale: string
}

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export const BaseLayout = async ({ children, locale }: Props) => {
  return (
    <html lang={locale}>
      <head>
        {/* <link rel="manifest" href="/manifest.json" /> */}
        {/* <link rel="icon" href="/fav.svg" type="image/svg+xml" /> */}
        {/* <link */}
        {/*   rel="icon" */}
        {/*   href="/favicon-32.png" */}
        {/*   sizes="32x32" */}
        {/*   type="image/png" */}
        {/* /> */}
        {/* <link */}
        {/*   rel="icon" */}
        {/*   href="/favicon-192.png" */}
        {/*   sizes="192x192" */}
        {/*   type="image/png" */}
        {/* /> */}
        {/* {isLocalEnv && <meta name="robots" content="noindex" />} */}
      </head>
      <body
        className={`${spaceGrotesk.className} ${spaceMono.className} ${inter.className} ${poppins.className} bg-[#090909]`}
      >
        {children}
      </body>
    </html>
  )
}
