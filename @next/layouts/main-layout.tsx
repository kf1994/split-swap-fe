// layouts/MainLayout.tsx
"use client"

import type React from "react"
import { useTheme } from "next-themes"
import { Header } from "@organisms"
import { useEffect, useState } from "react"
import { Footer } from "@atoms"
import useMediaQuery from "use-media-antd-query"

export const MainLayout: React.FC<{ children: React.ReactNode }> = ({
  children
}) => {
  const { theme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  return (
    <div className="app-container relative min-h-screen flex flex-col">
      <VideoBackground />
      <div className="content-overlay flex flex-col flex-1">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </div>
    </div>
  )
}

export const VideoBackground: React.FC = () => {
  const { theme } = useTheme()
  const colSize = useMediaQuery()
  const isMbl = ["xs", "sm"].includes(colSize)
  const [isLight, setIsLight] = useState(true)

  useEffect(() => {
    if (theme) {
      setIsLight(theme === "light")
    }
  }, [theme])

  return (
    <div className="">
      {/* Day video */}
      <video
        className={`absolute top-0 left-0 w-full h-full object-cover background-video transition-opacity duration-700 ${
          isLight ? "opacity-100" : "opacity-0"
        }`}
        autoPlay
        muted
        loop
        playsInline
      >
        <source
          src={isMbl ? "/mp4/mbl-day-bg.webm" : "/mp4/day-bg.mp4"}
          type={isMbl ? "video/webm" : "video/mp4"}
        />
      </video>

      {/* Night video */}
      <video
        className={`absolute top-0 left-0 w-full h-full object-cover background-video transition-opacity duration-700 ${
          !isLight ? "opacity-100" : "opacity-0"
        }`}
        autoPlay
        muted
        loop
        playsInline
      >
        <source
          src={isMbl ? "/mp4/mbl-night-bg.webm" : "/mp4/night-bg.mp4"}
          type={isMbl ? "video/webm" : "video/mp4"}
        />
      </video>
    </div>
  )
}
