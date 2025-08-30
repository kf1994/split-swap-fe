// components/Header.tsx
"use client"

import { useTheme } from "next-themes"
import {BurgerMenuIcon, CrossIcon, HistoryIcon, LogoutIcon, MoonStarIcon, SplitLogo, SunIcon, WalletIcon} from "@svgs"
import Image from "next/image"
import React, {useState} from "react"
import useMediaQuery from "use-media-antd-query";
import {Drawer} from "@atoms";

export const Header: React.FC = () => {
  const { theme, setTheme } = useTheme()
    const colSize = useMediaQuery()
    const isMbl = ["xs", "sm"].includes(colSize)

  const [openDrawer, setIsOpenDrawer] = useState(false)

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
                <SunIcon color={sunColor}/>
                <MoonStarIcon color={moonColor}/>
            </button>
        </div>
        }
      {isMbl && <div onClick={()=>{setIsOpenDrawer(true)}} className={" cursor-pointer h-[30px] relative  p-2 border border-white icon-bg rounded-full"}>
        <BurgerMenuIcon style={{position:"relative", top:"1px"}}/>
      </div>
      }
      <Drawer
          open={openDrawer}
          onClose={()=>{setIsOpenDrawer(false)}}
          title={
              <Image src={"/images/split.svg"} alt={"split"} width={144} height={30}/>
             }
          // direction='right'
          // className='bla bla bla'
      >
          <div className={"flex flex-col gap-3"}>
              <div className={"bg-[#383D56] p-4 flex justify-between rounded-lg"}>
                  <p className={"text-[16px] font-bold text-white"}>dksk...djsk</p>
                  <WalletIcon/>
              </div>
              <div className={"flex gap-2 items-center cursor-pointer"}>
                  <HistoryIcon/>
                  <p className={"text-white text-[14px] font-normal"}>History</p>
              </div>
              <div className={"flex gap-2 items-center cursor-pointer"}>
                  <LogoutIcon />
                  <p className={"text-white text-[14px] font-normal cursor-pointer"}>Disconnect wallet</p>
              </div>
          </div>
      </Drawer>
    </header>
  )
}
