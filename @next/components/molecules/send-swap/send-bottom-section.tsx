"use client"
import type React from "react"
import { useRef, useState } from "react"
import { SendWalletInput } from "./send-wallet-input"
import { PublicKey } from "@solana/web3.js"
import Papa from "papaparse"
import { CustomButton } from "@atoms"

interface Wallet {
  id: number
  address: string
  percentage: string
  error?: string
}

export const SendBottomSection: React.FC = () => {
  const [wallets, setWallets] = useState<Wallet[]>([])
  const [initialAddress, setInitialAddress] = useState<string>("")
  const [initialError, setInitialError] = useState<string>("")
  const [loading, setLoading] = useState(false)
  const [progress, setProgress] = useState(0)
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  const [distributionEnabled, setDistributionEnabled] = useState(false)

  const applyDistribution = (count: number): void => {
    const equalShare = (100 / count).toFixed(2)
    setWallets((prev) => prev.map((w) => ({ ...w, percentage: equalShare })))
  }

  const toggleDistribution = (checked: boolean) => {
    setDistributionEnabled((prev) => !prev)
    if (checked && wallets.length > 0) {
      applyDistribution(wallets.length)
    }
  }

  const handleImportClick = (): void => {
    if (fileInputRef.current) {
      fileInputRef.current.click()
    }
  }

  const validateSolanaAddress = (
    address: string
  ): { isValid: boolean; error?: string } => {
    try {
      const publicKey = new PublicKey(address)
      if (!PublicKey.isOnCurve(publicKey.toBytes())) {
        return { isValid: false, error: "Invalid: not an on-curve wallet" }
      }
      return { isValid: true }
    } catch {
      return { isValid: false, error: "Invalid wallet address" }
    }
  }

  const addWallet = (): void => {
    const newWallet: Wallet = {
      id: Date.now(),
      address: "",
      percentage: distributionEnabled
        ? (100 / (wallets.length + 1)).toFixed(2)
        : "",
      error: ""
    }

    const updated = [...wallets, newWallet]
    setWallets(updated)

    // 🔹 If distribution is ON, re-apply equal share
    if (distributionEnabled) {
      applyDistribution(updated.length)
    }
  }

  const updateWallet = (
    id: number,
    field: "address" | "percentage",
    value: any
  ): void => {
    setWallets((prev) =>
      prev.map((w) => {
        if (w.id === id) {
          if (field === "address") {
            const validation = validateSolanaAddress(value)
            return { ...w, address: value, error: validation.error ?? "" }
          }
          // 🔹 If distribution is ON, percentage should not be editable
          if (distributionEnabled && field === "percentage") {
            return w
          }
          return { ...w, [field]: value }
        }
        return w
      })
    )
  }

  const removeWallet = (id: number): void => {
    setWallets(wallets.filter((w) => w.id !== id))
  }

  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setLoading(true)
    setProgress(0)
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results: any) => {
        const data = results.data as Array<{ address: string }>
        const unique = Array.from(
          new Set(data.map((row) => row.address.trim()))
        )
        const newWallets: Wallet[] = unique.map((addr, index) => {
          const validation = validateSolanaAddress(addr)
          return {
            id: Date.now() + index,
            address: addr,
            percentage: distributionEnabled
              ? (100 / unique.length).toFixed(2)
              : "",
            error: validation.error ?? ""
          }
        })
        setWallets(newWallets)
        setProgress(100)
        setLoading(false)
        if (distributionEnabled && newWallets.length > 0) {
          applyDistribution(newWallets.length)
        }
      }
    })
    e.target.value = ""
  }

  return (
    <div>
      <div className="bg-[#383D56] mt-[6px] flex flex-col gap-2 rounded-xl p-4 w-full">
        {/* Receiving address header */}
        <div className="flex justify-between items-center">
          <span className="text-sm font-normal text-white">
            Receiving wallet address
          </span>

          <label>
            <button
              type="button"
              onClick={handleImportClick}
              className="border border-[#A6A0BB] text-white text-sm px-4 py-2 rounded-xl "
            >
              Import
            </button>
            <input
              type="file"
              accept=".csv,.txt"
              className="hidden"
              ref={fileInputRef}
              onChange={handleFileChange}
            />
          </label>
        </div>

        {/* Initial input */}
        {wallets.length < 2 && (
          <div>
            <input
              placeholder="Receiving wallet address"
              value={initialAddress}
              onChange={(e) => {
                const value = e.target.value
                setInitialAddress(value)
                const validation = validateSolanaAddress(value)
                setInitialError(validation.error ?? "")
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" && initialAddress.trim()) {
                  const validation = validateSolanaAddress(
                    initialAddress.trim()
                  )
                  setWallets((prev) => [
                    ...prev,
                    {
                      id: Date.now(),
                      address: initialAddress.trim(),
                      percentage: "",
                      error: validation.error ?? ""
                    }
                  ])
                  setInitialAddress("")
                  setInitialError("")
                }
              }}
              className="flex-1 border border-[#46456C] rounded-xl bg-[#383D56] w-full px-4 py-3 text-sm text-white
             outline-none focus:outline-none focus:border-[#46456C]"
            />
            {initialError && (
              <p className="text-red-400 text-xs mt-1">{initialError}</p>
            )}
          </div>
        )}

        {/* Progress bar */}
        {loading && (
          <div className="w-full h-2 bg-[#2C2F45] rounded-lg overflow-hidden mt-2">
            <div
              className="h-full bg-gradient-to-r from-indigo-500 to-purple-600 transition-all duration-200"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}

        {wallets.length >= 2 && (
          <div className="bg-[#444A66] px-4 py-3 rounded-xl flex justify-between items-center text-white text-sm">
            <span>Distribution</span>
            <div className="flex items-center gap-2">
              <span className={"text-[#A6A0BB] text-[16px]  font-normal"}>
                Randomized
              </span>
              <button
                type="button"
                onClick={toggleDistribution}
                className={`w-[28px] h-4 flex items-center rounded-full transition-colors duration-300 ${
                  distributionEnabled ? "bg-[#7B61FF]" : "bg-gray-500"
                }`}
              >
                <span
                  className={`w-4 h-4 bg-white rounded-full shadow-md transform transition-transform duration-300 ${
                    distributionEnabled ? "translate-x-4" : "translate-x-0"
                  }`}
                />
              </button>
              <span>%</span>
            </div>
          </div>
        )}

        {/* Wallet list */}
        <div className="max-h-64 overflow-y-auto smart-scroll rounded-lg">
          {wallets.map((w) => (
            <div key={w.id}>
              <SendWalletInput
                address={w.address}
                percentage={w.percentage}
                onAddressChange={(val) => {
                  updateWallet(w.id, "address", val)
                }}
                onPercentageChange={(val) => {
                  updateWallet(w.id, "percentage", val)
                }}
                onRemove={() => {
                  removeWallet(w.id)
                }}
              />
              {w.error && (
                <p className="text-red-400 text-xs mb-1">{w.error}</p>
              )}
            </div>
          ))}
        </div>

        {/* Add wallet button */}
        <button
          onClick={addWallet}
          className="w-full text-start text-sm text-[#A6A0BB] mt-2"
        >
          + Add more receiving wallets
        </button>
      </div>

      <CustomButton
        disabled={true}
        variant={"linear-blue"}
        className="w-full flex justify-center items-center mt-6 px-6 py-4 rounded-xl"
      >
        <p className={"text-[16px] font-bold"}>Swap</p>
      </CustomButton>
    </div>
  )
}
