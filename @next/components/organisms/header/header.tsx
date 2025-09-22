"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { useTheme } from "next-themes"
import {
  BurgerMenuIcon,
  HistoryIcon,
  LogoutIcon,
  MoonStarIcon,
  SunIcon,
  WalletIcon
} from "@svgs"
import { useWallet } from "@solana/wallet-adapter-react"
import { useWalletModal } from "@solana/wallet-adapter-react-ui"
import useMediaQuery from "use-media-antd-query"
import { ActionMainButton, CustomButton, CustomTooltip, Drawer } from "@atoms"
import { useRouter } from "next/navigation"
import { userProfileStore } from "@store"
import { useShallow } from "zustand/react/shallow"

export const Header: React.FC = () => {
  const { theme, setTheme } = useTheme()
  const router = useRouter()
  const { wallets, connected, disconnect, publicKey } = useWallet()
  const { setVisible } = useWalletModal()
  const colSize = useMediaQuery()
  const isMbl = ["xs", "sm"].includes(colSize)
  const [copyLabel, setCopyLabel] = useState<string>("Copy")
  const [setWalletAddress] = userProfileStore(
    useShallow((s) => [s.setWalletAddress])
  )

  const slicedPubKey =
    // eslint-disable-next-line @typescript-eslint/restrict-plus-operands
    publicKey?.toBase58().slice(0, 4) + "..." + publicKey?.toBase58().slice(-4)
  const [openDrawer, setIsOpenDrawer] = useState(false)

  const [showDropdown, setShowDropdown] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  useEffect(() => {
    if (!connected) return
    setWalletAddress(publicKey?.toBase58())
  }, [publicKey])

  const onCopy = (): void => {
    navigator.clipboard.writeText(publicKey ? publicKey?.toBase58() : "")
    setCopyLabel("Copied!")
    setTimeout(() => {
      setCopyLabel("Copy")
    }, 3000)
  }

  // Define colors for icons
  const sunColor = theme === "light" ? "#46456C" : "#fff"
  const moonColor = theme === "light" ? "#fff" : "#46456C"

  return (
    <header className="header-parent">
      {/* Logo */}

      <img
        src={"/images/main-split.gif"}
        alt={"Split"}
        className={"cursor-pointer h-[55px]"}
        onClick={() => {
          router.push("/swap")
        }}
      />
      {/* <video */}
      {/*   src="/images/main-split.mp4" */}
      {/*   autoPlay */}
      {/*   loop */}
      {/*   muted */}
      {/*   playsInline */}
      {/*   className={"cursor-pointer h-[40px]"} */}
      {/*   onClick={() => { */}
      {/*     router.push("/swap") */}
      {/*   }} */}
      {/* /> */}

      {/* Right Section */}
      {!isMbl && (
        <div className={"flex gap-2 items-center"}>
          {connected && (
            <p
              className={
                "text-[16px] cursor-pointer font-bold flex text-white items-center"
              }
              onClick={() => {
                router.push("/history")
              }}
            >
              History{" "}
            </p>
          )}
          {/* Connect Wallet */}
          {!connected && (
            <CustomButton
              variant={"gray-bold"}
              disabled={false}
              onClick={() => {
                setVisible(true)
              }}
              labelClassName={"text-white text-[16px] font-bold flex"}
            >
              Connect wallet
            </CustomButton>
          )}

          {connected && (
            <div className="relative" ref={dropdownRef}>
              <div
                onClick={() => {
                  setShowDropdown((prev) => !prev)
                }}
                className="flex  items-center justify-center gap-2 px-6 py-3 text-white font-medium cursor-pointer"
                style={{
                  borderRadius: "16px",
                  // border: "1px solid #FFF",
                  background:
                    "linear-gradient(81deg, rgba(136, 147, 162, 0.80) 41.26%, rgba(163, 171, 183, 0.80) 58.85%)"
                }}
              >
                <CustomTooltip
                  trigger={
                    <span onClick={onCopy}>
                      <WalletIcon />
                    </span>
                  }
                  content={<span>{copyLabel}</span>}
                />

                <p className="text-[16px] font-bold">{slicedPubKey}</p>
              </div>

              {showDropdown && (
                <div className="absolute right-0 mt-2 w-[260px] dropdown-bg rounded-xl border border-[#DFE2EB] text-white p-3 flex flex-col gap-3 z-50">
                  <div className="flex gap-2 justify-between items-center cursor-pointer bg-[#A7ADBD] border border-[#DFE2EB] rounded-[8px] px-3 py-2">
                    <p className="text-[16px] font-bold ">{slicedPubKey}</p>

                    <CustomTooltip
                      trigger={
                        <div
                          className={" shrink-0 cursor-pointer"}
                          onClick={onCopy}
                          data-tip={copyLabel}
                        >
                          <WalletIcon />
                        </div>
                      }
                      content={<span>{copyLabel}</span>}
                    />
                  </div>
                  <div
                    className="flex gap-2 items-center cursor-pointer"
                    onClick={() => {
                      void disconnect()
                      setWalletAddress(undefined)
                      setShowDropdown(false)
                    }}
                  >
                    <LogoutIcon />
                    <p className="text-[14px] font-normal">Disconnect wallet</p>
                  </div>
                </div>
              )}
            </div>
          )}

          <button
            onClick={() => {
              setTheme(theme === "light" ? "dark" : "light")
            }}
            style={{
              display: "flex",
              gap: 10,
              alignItems: "center",
              borderRadius: "16px",
              // border: "1px solid #FFF",
              background:
                "linear-gradient(81deg, rgba(136, 147, 162, 0.80) 41.26%, rgba(163, 171, 183, 0.80) 58.85%)",
              padding: "8px 10px",
              height: 48
            }}
          >
            <SunIcon color={sunColor} />
            <MoonStarIcon color={moonColor} />
          </button>
        </div>
      )}
      {isMbl && (
        <div
          onClick={() => {
            setIsOpenDrawer(true)
          }}
          className={
            " cursor-pointer h-[30px] relative  bg-[linear-gradient(81deg, rgba(136, 147, 162, 0.80) 41.26%, rgba(163, 171, 183, 0.80) 58.85%)]  p-2 border border-white icon-bg rounded-full"
          }
        >
          <BurgerMenuIcon
            style={{
              position: "relative",
              top: "1px"
            }}
          />
        </div>
      )}
      <Drawer
        open={openDrawer}
        onClose={() => {
          setIsOpenDrawer(false)
        }}
        title={
          <img
            src={"/images/split.svg"}
            className={"cursor-pointer"}
            onClick={() => {
              router.push("/")
            }}
            alt={"split"}
            width={144}
            height={30}
          />
        }
      >
        <div className={"flex flex-col gap-3"}>
          {connected && (
            <div className={"bg-[#383D56] p-3 flex justify-between rounded-lg"}>
              <p className={"text-[16px] font-bold text-white"}>
                {slicedPubKey}
              </p>
              <CustomTooltip
                trigger={
                  <span onClick={onCopy}>
                    <WalletIcon />
                  </span>
                }
                content={<span>{copyLabel}</span>}
              />
            </div>
          )}
          {!connected && (
            <div
              className={"flex gap-2 pt-3  pb-3 items-center"}
              onClick={() => {
                setVisible(true)
              }}
            >
              <WalletIcon width={16} height={16} />
              <p
                className={"text-white text-[14px] font-normal cursor-pointer"}
              >
                Connect wallet
              </p>
            </div>
          )}
          {connected && (
            <div
              className={"flex gap-2 pt-3 pb-3 items-center cursor-pointer"}
              onClick={() => {
                router.push("/history")
              }}
            >
              <HistoryIcon />
              <p
                className={"text-white text-[14px] cursor-pointer font-normal"}
              >
                History
              </p>
            </div>
          )}
          <div
            className={"flex gap-2 items-center cursor-pointer"}
            onClick={() => {
              void disconnect()
              setWalletAddress(undefined)
            }}
          >
            <LogoutIcon />
            <p className={"text-white text-[14px] font-normal cursor-pointer"}>
              Disconnect wallet
            </p>
          </div>
        </div>
      </Drawer>
    </header>
  )
}
