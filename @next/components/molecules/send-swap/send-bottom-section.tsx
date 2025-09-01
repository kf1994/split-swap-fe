"use client"
import type React from "react"
import { useRef, useState } from "react"
import { SendWalletInput } from "./send-wallet-input"

interface Wallet {
  id: number
  address: string
  percentage: number
}

export const SendBottomSection: React.FC = () => {
  const [wallets, setWallets] = useState<Wallet[]>([])
  const [randomized, setRandomized] = useState(false)
  const [initialAddress, setInitialAddress] = useState<string>("")
  const [loading, setLoading] = useState(false)
  const [progress, setProgress] = useState(0)
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  const handleImportClick = (): void => {
    if (fileInputRef.current) {
      fileInputRef.current.click()
    }
  }

  const addWallet = (): void => {
    setWallets([...wallets, { id: Date.now(), address: "", percentage: 0 }])
  }

  const updateWallet = (
    id: number,
    field: "address" | "percentage",
    value: any
  ): void => {
    setWallets((prev) =>
      prev.map((w) => (w.id === id ? { ...w, [field]: value } : w))
    )
  }

  const removeWallet = (id: number): void => {
    setWallets(wallets.filter((w) => w.id !== id))
  }

  const handleFileChange = async (
    e: React.ChangeEvent<HTMLInputElement>
  ): void => {
    const file = e.target.files?.[0]
    if (!file) return

    setLoading(true)
    setProgress(0)

    const reader = new FileReader()

    reader.onloadstart = () => {
      setProgress(10)
    }
    reader.onprogress = (event) => {
      if (event.lengthComputable) {
        const percent = Math.round((event.loaded / event.total) * 100)
        setProgress(percent)
      }
    }
    reader.onload = () => {
      setProgress(100)
      const text = reader.result as string
      const rows = text
        .split("\n")
        .map((line) => line.trim())
        .filter(Boolean)

      // Example: CSV with only addresses OR with address,percentage
      const parsedWallets: Wallet[] = rows.map((row, i) => {
        const [address, perc] = row.split(",")
        return {
          address: address.trim(),
          percentage: perc ? Number(perc.trim()) : 0
        }
      })

      setWallets(parsedWallets)
      setTimeout(() => {
        setLoading(false)
      }, 800) // small delay to show full progress
    }
    reader.onerror = () => {
      console.error("File reading error")
      setLoading(false)
    }

    reader.readAsText(file)
  }
  return (
    <div className="bg-[#383D56] mt-[6px] flex flex-col gap-2 rounded-xl p-4 w-full">
      {/* Receiving address header */}
      <div className="flex justify-between items-center">
        <span className="text-sm font-normal text-white">
          Receiving wallet address
        </span>

        <label>
          <button
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
      <div>
        <input
          placeholder="Receiving wallet address"
          value={initialAddress}
          onChange={(e) => {
            setInitialAddress(e.target.value)
          }}
          className="flex-1 border border-[#46456C] rounded-xl bg-[#383D56] w-full px-4 py-3 text-sm text-white
             outline-none focus:outline-none focus:border-[#46456C]"
        />
      </div>

      {/* Progress bar */}
      {loading && (
        <div className="w-full h-2 bg-[#2C2F45] rounded-lg overflow-hidden mt-2">
          <div
            className="h-full bg-gradient-to-r from-indigo-500 to-purple-600 transition-all duration-200"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}

      {/* Wallet list */}
      {wallets.map((w) => (
        <SendWalletInput
          key={w.id}
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
      ))}

      {/* Add wallet button */}
      <button
        onClick={addWallet}
        className="w-full text-start text-sm text-[#A6A0BB] mt-2"
      >
        + Add more receiving wallets
      </button>
    </div>
  )
}
