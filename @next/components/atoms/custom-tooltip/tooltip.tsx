"use client"
import type React from "react"

interface TooltipProps {
  text: string
  children: React.ReactNode
}

export const Tooltip: React.FC<TooltipProps> = ({ text, children }) => {
  return (
    <div className="relative group inline-block">
      {children}
      <span
        className="absolute -top-10 left-1/2 -translate-x-1/2 w-max
                   bg-black text-white text-xs px-3 py-1 rounded
                   opacity-0 group-hover:opacity-100
                   transition-opacity duration-200 pointer-events-none"
      >
        {text}
        {/* Arrow */}
        <span className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-black"></span>
      </span>
    </div>
  )
}
