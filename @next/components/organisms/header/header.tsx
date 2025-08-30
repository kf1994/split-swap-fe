// components/Header.tsx
"use client"

import { useTheme } from "next-themes"
import { MoonStarIcon, SplitLogo, SunIcon } from "@svgs"
import Image from "next/image"
import type React from "react"

export const Header: React.FC = () => {
  const { theme, setTheme } = useTheme()

  // Define colors for icons
  const sunColor = theme === "light" ? "#46456C" : "#fff"
  const moonColor = theme === "light" ? "#fff" : "#46456C"

  return (
    <header className="header-parent">
      {/* Logo */}
      {/* <div className="text-white font-extrabold text-xl tracking-wide"> */}
      {/*   SPLIT ✦ */}
      {/* </div> */}
      {/* <Image src={"/images/split.svg"} alt={"split"} width={192} height={40} /> */}
      <SplitLogo />

      {/* Right Section */}
      <div style={{ display: "flex", gap: "8px" }}>
        {/* Connect Wallet */}
        <button
          className="flex items-center justify-center gap-2 px-6 py-3 text-white font-medium"
          style={{
            borderRadius: "16px",
            border: "1px solid #FFF",
            background:
              "linear-gradient(81deg, rgba(136, 147, 162, 0.80) 41.26%, rgba(163, 171, 183, 0.80) 58.85%)"
          }}
        >
          <p className={"paragraph"}>Connect wallet</p>
        </button>

        {/* Theme Toggle (Both icons always visible) */}
        <button
          onClick={() => {
            setTheme(theme === "light" ? "dark" : "light")
          }}
          style={{
            display: "flex",
            gap: 4,
            alignItems: "center",
            borderRadius: "16px",
            border: "1px solid #FFF",
            background:
              "linear-gradient(81deg, rgba(136, 147, 162, 0.80) 41.26%, rgba(163, 171, 183, 0.80) 58.85%)",
            padding: "8px"
          }}
        >
          <SunIcon color={sunColor} />
          <MoonStarIcon color={moonColor} />
        </button>
      </div>
    </header>
  )
}
