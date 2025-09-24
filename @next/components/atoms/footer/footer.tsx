import Image from "next/image"
import useMediaQuery from "use-media-antd-query"
import type React from "react"

export const Footer: React.FC = () => {
  const colSize = useMediaQuery()
  const isMbl = ["xs", "sm"].includes(colSize)
  return (
    <footer className="flex items-center justify-between px-6 py-4 text-white mt-auto">
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
        <a href="https://split-swap.gitbook.io/product-docs" target="_blank">
          <Image src={"/images/docs.png"} alt={"docs"} width={48} height={48} />
        </a>
        <a href="https://x.com/Split_Swap" target="_blank">
          <Image src={"/images/x.png"} alt={"X"} width={48} height={48} />
        </a>
      </div>
    </footer>
  )
}
