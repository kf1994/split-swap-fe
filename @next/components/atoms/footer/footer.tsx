"use client"

import Image from "next/image"
import useMediaQuery from "use-media-antd-query"
import type React from "react"
import { useState } from "react"
import { QuestionMarkIcon, WalletIcon } from "@svgs"
import { Poppins } from "next/font/google"

const poppins = Poppins({
  subsets: ["latin"],
  style: ["normal"],
  weight: ["400", "700"],
  display: "swap"
})

export const Footer: React.FC = () => {
  const colSize = useMediaQuery()
  const isMbl = ["xs", "sm"].includes(colSize)

  const [helpModal, setHelpModal] = useState<null | "splitswap" | "swap">(null)

  // optional: close modal when clicking ESC
  // useEffect(() => {
  //   const handler = (e: KeyboardEvent) => {
  //     if (e.key === "Escape") setHelpModal(null)
  //   }
  //   window.addEventListener("keydown", handler)
  //   return () => window.removeEventListener("keydown", handler)
  // }, [])

  return (
    <>
      <footer
        className={`flex items-center justify-between px-6 py-4 text-white mt-auto ${
          isMbl ? "flex-col gap-2" : ""
        }`}
      >
        <div className="flex gap-3">
          {/* How to use Splitswap */}
          <button
            type="button"
            onClick={() => setHelpModal("splitswap")}
            className="py-2 px-3 flex justify-center rounded-xl cursor-pointer transition-transform duration-150 active:scale-[0.97]"
            style={{
              background:
                "linear-gradient(81deg, rgba(136, 147, 162, 0.80) 41.26%, rgba(163, 171, 183, 0.80) 58.85%)"
            }}
          >
            <div className="flex gap-2 items-center">
              <QuestionMarkIcon />
              <p
                className={`text-white text-[14px] whitespace-nowrap font-medium ${poppins.className}`}
              >
                How to use Splitswap
              </p>
            </div>
          </button>

          {/* How to Swap */}
          <button
            type="button"
            onClick={() => setHelpModal("swap")}
            className="py-2 px-3 flex justify-center rounded-xl cursor-pointer transition-transform duration-150 active:scale-[0.97]"
            style={{
              background:
                "linear-gradient(81deg, rgba(136, 147, 162, 0.80) 41.26%, rgba(163, 171, 183, 0.80) 58.85%)"
            }}
          >
            <div className="flex gap-2 items-center">
              <QuestionMarkIcon />
              <p
                className={`text-white text-[14px] whitespace-nowrap font-medium ${poppins.className}`}
              >
                How to Swap
              </p>
            </div>
          </button>
        </div>

        <div
          className={`flex gap-2 w-full ${
            isMbl ? "justify-center" : "justify-end"
          }`}
        >
          <a href="/" target="_blank">
            <Image
              src={"/images/telegram.png"}
              alt={"Telegram"}
              width={48}
              height={48}
            />
          </a>
          <a
            href="https://split-swap.gitbook.io/product-docs"
            target="_blank"
          >
            <Image src={"/images/docs.png"} alt={"docs"} width={48} height={48} />
          </a>
          <a href="https://x.com/Split_Swap" target="_blank">
            <Image src={"/images/x.png"} alt={"X"} width={48} height={48} />
          </a>
        </div>
      </footer>

      {/* Custom Modal (no AntD) */}
      {helpModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4"
          onClick={() => setHelpModal(null)} // click outside to close
        >
          <div
            className="relative w-full max-w-md rounded-2xl bg-[#171827] border border-[#3C3F5A] p-8 shadow-xl text-white animate-[fadeInScale_0.18s_ease-out]"
            onClick={(e) => e.stopPropagation()} // prevent closing when clicking inside
          >
            {/*<button*/}
            {/*  type="button"*/}
            {/*  onClick={() => setHelpModal(null)}*/}
            {/*  className="absolute right-4 top-3 text-[#8C90B0] hover:text-white text-xl leading-none"*/}
            {/*>*/}
            {/*  ×*/}
            {/*</button>*/}

            {helpModal === "splitswap" && (
              <>
                <h2 className="text-lg font-boldmb-3">
                  How to use Splitswap
                </h2>
              </>
            )}

            {helpModal === "swap" && (
              <>
                <h2 className="text-lg font-bold mb-3">How to Swap</h2>
              </>
            )}

          </div>
        </div>
      )}
    </>
  )
}
