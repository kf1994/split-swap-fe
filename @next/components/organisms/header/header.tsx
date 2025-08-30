"use client"

import React, {useState, useRef, useEffect} from "react"
import { useTheme } from "next-themes"
import {BurgerMenuIcon, CrossIcon, HistoryIcon, LogoutIcon, MoonStarIcon, SplitLogo, SunIcon, WalletIcon} from "@svgs"
import { useWallet } from "@solana/wallet-adapter-react"
import { useWalletModal } from "@solana/wallet-adapter-react-ui"
import Image from "next/image"
import useMediaQuery from "use-media-antd-query";
import {Drawer} from "@atoms";


export const Header: React.FC = () => {
  const { theme, setTheme } = useTheme()
  const { wallets,connected, disconnect, publicKey } = useWallet()
  const { setVisible } = useWalletModal()
  const colSize = useMediaQuery()
  const isMbl = ["xs", "sm"].includes(colSize)
    const [copyLabel, setCopyLabel] = useState<string>("Copy")


    console.log("PubKey==>",  publicKey?.toBase58() , connected)

    const slicedPubKey = publicKey?.toBase58().slice(0, 4) + "..." + publicKey?.toBase58().slice(-4)
  const [openDrawer, setIsOpenDrawer] = useState(false)

    const [showDropdown, setShowDropdown] = useState(false)
    const dropdownRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setShowDropdown(false)
            }
        }
        document.addEventListener("mousedown", handleClickOutside)
        return () => {
            document.removeEventListener("mousedown", handleClickOutside)
        }
    }, [])

    const onCopy = () => {
        navigator.clipboard.writeText(publicKey?.toBase58())
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
      <SplitLogo />

      {/* Right Section */}

        {!isMbl && <div style={{display: "flex", gap: "8px"}}>
            {/* Connect Wallet */}
            {!connected &&
                <button
                    className="flex items-center justify-center gap-2 px-6 py-3 text-white font-medium"
                    style={{
                        borderRadius: "16px",
                        border: "1px solid #FFF",
                        background:
                            "linear-gradient(81deg, rgba(136, 147, 162, 0.80) 41.26%, rgba(163, 171, 183, 0.80) 58.85%)"
                    }}
                >
                    <p className={"paragraph"} onClick={() => setVisible(true)}>Connect wallet</p>
                </button>
            }

            {connected && (
                <div className="relative" ref={dropdownRef}>
                    <button
                        onClick={() => setShowDropdown((prev) => !prev)}
                        className="flex items-center justify-center gap-2 px-6 py-3 text-white font-medium cursor-pointer"
                        style={{
                            borderRadius: "16px",
                            border: "1px solid #FFF",
                            background:
                                "linear-gradient(81deg, rgba(136, 147, 162, 0.80) 41.26%, rgba(163, 171, 183, 0.80) 58.85%)",
                        }}
                    >
                        <WalletIcon />
                        <p className="text-[16px] font-bold">
                            {slicedPubKey}
                        </p>
                    </button>

                    {showDropdown && (
                        <div className="absolute right-0 mt-2 w-48 rounded-xl bg-[#A7ADBD] border border-[#DFE2EB] rounded-[8px] text-white shadow-lg p-3 flex flex-col gap-3 z-50">
                            <div className="flex gap-2 justify-between items-center cursor-pointer">
                                <p className="text-[16px] font-bold">
                                    {slicedPubKey}
                                </p>
                                <div
                                    className={" shrink-0 cursor-pointer"}
                                    onClick={onCopy}
                                    data-tip={copyLabel}
                                >
                                    <WalletIcon />
                                </div>
                            </div>
                            <div
                                className="flex gap-2 items-center cursor-pointer"
                                onClick={() => {
                                    disconnect()
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
                    border: "1px solid #FFF",
                    background:
                        "linear-gradient(81deg, rgba(136, 147, 162, 0.80) 41.26%, rgba(163, 171, 183, 0.80) 58.85%)",
                    padding: "8px 10px"

                }}
            >
                <SunIcon color={sunColor}/>
                <MoonStarIcon color={moonColor}/>
            </button>
        </div>
        }
      {isMbl &&
          <div onClick={()=>{setIsOpenDrawer(true)}} className={" cursor-pointer h-[30px] relative  p-2 border border-white icon-bg rounded-full"}>
            <BurgerMenuIcon style={{position:"relative", top:"1px"}}/>
          </div>
      }
      <Drawer
          open={openDrawer}
          onClose={()=>{setIsOpenDrawer(false)}}
          title={
              <Image src={"/images/split.svg"} alt={"split"} width={144} height={30}/>
             }
      >
          <div className={"flex flex-col gap-3"}>
              {connected &&
                  <div className={"bg-[#383D56] p-4 flex justify-between rounded-lg"}>
                      <p className={"text-[16px] font-bold text-white"}>{ slicedPubKey}</p>
                      <div onClick={onCopy}>
                        <WalletIcon/>
                      </div>
                  </div>
              }
              {!connected &&
                  <div className={"flex gap-2 items-center"} onClick={()=> {setVisible(true)}}>
                      <WalletIcon width={16} height={16}/>
                      <p className={"text-white text-[14px] font-normal cursor-pointer"}>Connect Wallet</p>
                  </div>
              }
              <div className={"flex gap-2 items-center cursor-pointer"}>
                  <HistoryIcon/>
                  <p className={"text-white text-[14px] font-normal"}>History</p>
              </div>
              <div className={"flex gap-2 items-center cursor-pointer"} onClick={()=> {
                  disconnect()
              }}>
                  <LogoutIcon />
                  <p className={"text-white text-[14px] font-normal cursor-pointer"}>Disconnect wallet</p>
              </div>
          </div>
      </Drawer>
    </header>
  )
}
