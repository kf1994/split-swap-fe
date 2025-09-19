// /* eslint-disable @typescript-eslint/explicit-function-return-type */
// import { SOL_TOKEN, USDC_ADDRESS } from "@config"
// import React from "react"

// export const usePrice = () => {
//   const fetchTokenPrices = async (
//     tokenIds: string[]
//   ): Promise<Record<string, TokenPrice> | null> => {
//     try {
//       const usdPriceData = await fetchPriceData({
//         tokenIds: [...tokenIds, ],
//         against: USDC_ADDRESS,
//         connection
//       })
//       if (usdPriceData) {
//         const priceResult: Record<string, TokenPrice> = {}
//         const solPriceInUsd = usdPriceData[SOL_TOKEN.address]
//           ? usdPriceData[SOL_TOKEN.address]?.price
//           : prices[SOL_TOKEN.address]?.usd
//         tokenIds.forEach((tokenId) => {
//           const usdPrice = usdPriceData[tokenId]?.price || 0
//           const solPrice =
//             tokenId === SOL_TOKEN.address
//               ? 1
//               : solPriceInUsd > 0
//               ? usdPrice / solPriceInUsd
//               : 0
//           priceResult[tokenId] = {
//             usd: usdPrice,
//             sol: solPrice
//           }
//         })

//         return priceResult
//       }

//       return null
//     } catch (error) {
//       console.error("Error fetching token prices:", error)
//       return null
//     }
//   }
//   return <div>usePrice</div>
// }
export {}
