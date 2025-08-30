// layouts/MainLayout.tsx
"use client"

import type React from "react"
import { useTheme } from "next-themes"
import { Header } from "@organisms"
import { useEffect, useState } from "react"

export const MainLayout: React.FC<{ children: React.ReactNode }> = ({
  children
}) => {
  const { theme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  const videoSrc = theme === "dark" ? "/mp4/dark-bg.mp4" : "/mp4/day-bg.mp4"

  return (
    <div className="app-container">
      <VideoBackground />
      <div className="content-overlay">
        <Header />
        <div>{children}</div>
      </div>
    </div>
  )
}

export const VideoBackground = () => {
  const { theme } = useTheme()
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
        <source src="/mp4/day-bg.mp4" type="video/mp4" />
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
        <source src="/mp4/night-bg.mp4" type="video/mp4" />
      </video>
    </div>
  )
}
