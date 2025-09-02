import { type Pool, type TokenInfo } from "@types"

export const getRelatedPool = (token: TokenInfo, pools: Pool[], quoteCurrency: string) => {
  const relatedPools = pools.filter(
    (pool) =>
      pool.baseCurrency.address === token?.address && pool.maxBorrow.gt(0) && pool.quoteCurrency.address === quoteCurrency
  )

  return relatedPools.sort((a, b) => {
    const bTotalFunds = Number(b?.nodeWallet?.totalFunds?.toString())
    const aTotalFunds = Number(a?.nodeWallet?.totalFunds?.toString())
    return bTotalFunds - aTotalFunds
  })[0]
}
