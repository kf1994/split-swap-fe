import React, {useState} from "react"
import { NumericTokenInput } from "@atoms"
import Image from "next/image"
import {TokenDropdown} from "../token-dropdown";
import {userProfileStore} from "../../../store/use-profile-store";
import {useShallow} from "zustand/react/shallow"; // example icon

interface SwapInputBoxProps {
  label: string
  value: string
  onChange: (val: string) => void
  balance?: number
  token: string
  setCurrentState?: (val:"1" | "2") => void
}

export const SwapTokenBox: React.FC<SwapInputBoxProps> = ({
  label,
  value,
  onChange,
  balance
}) => {
    const [selectedToken, setCurrentState, currentState] = userProfileStore(
        useShallow((s) => [ s.selectedToken, s.setCurrentState,s.currentState])
    )
    console.log("Curent State==>",currentState)
  return (
    <div className="bg-[#383D56] rounded-xl p-4 flex flex-col gap-3 w-full">
      {/* Header */}
      <div className="flex justify-between items-center text-sm text-gray-400">
        <span className={"text-[14px] text-white font-normal"}>{label}</span>
        <div className={"flex gap-3 items-center"}>
          {balance !== undefined && (
            <span className={"text-[14px] font-normal text-[#A6A0BB]"}>
              Balance: {balance}
            </span>
          )}
          {label === "From" && (
            <>
              <button className="px-2 py-1 flex justify-center rounded-lg border border-[#46456C]  hover:bg-[#46456C] hover:border-[#503EDC]">
                Half
              </button>
              <button className="px-2 py-1 flex justify-center  rounded-lg border border-[#46456C] hover:bg-[#46456C] hover:border-[#503EDC]">
                Full
              </button>
            </>
          )}
        </div>
      </div>

      {/* Input + Select */}
      <div className="flex justify-between items-center gap-2">
        <NumericTokenInput
            value={value}
            setValue={(value) => {
              onChange(value)
            }}
            MAX_VALUE={Number.MAX_SAFE_INTEGER}
            MIN_VALUE={0}
            className="bg-transparent border-none outline-none text-[28px] font-bold w-full"
            connected={true}
        />

        {/*<TokenDropdown*/}
        {/*    onSelect={(val:string)=>{onTokenChange?.(val)}}*/}
        {/*    selected={selectedToken}*/}
        {/*    setCurrentState={setCurrentState}*/}
        {/*/>*/}

        <button
            onClick={() => setCurrentState?.("2")}
            className={` flex items-center border border-transparent w-[250px] justify-between bg-[#444A66] hover:border-[#503EDC] px-3 py-2 rounded-xl text-white ${
                selectedToken ? "font-bold" : "font-normal"
            }`}
        >
          {selectedToken ? (
              <div className="flex items-center gap-2">
                <Image src={selectedToken.icon} alt={selectedToken.name} width={24} height={24}/>
                {selectedToken.symbol}
              </div>
          ) : (
              "Select"
          )}
          <Image src={"/images/arrow-down.svg"} alt="arrow" width={16} height={16}/>
        </button>

      </div>

      <span className="text-xs text-gray-400">$12.2272</span>
    </div>
  )
}
