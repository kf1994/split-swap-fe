import { LAMPORTS_PER_SOL } from "@solana/web3.js"
import BigNumber from "bignumber.js"

export const formatLamportsToSol = (
  lamports: number | BigNumber
): BigNumber => {
  if (lamports instanceof BigNumber) {
    return lamports.dividedBy(LAMPORTS_PER_SOL)
  }
  return BigNumber(lamports / LAMPORTS_PER_SOL)
}

export const formatSolToLamports = (sol: number | BigNumber): BigNumber => {
  if (sol instanceof BigNumber) {
    return sol.times(LAMPORTS_PER_SOL)
  }
  return BigNumber(sol).times(LAMPORTS_PER_SOL)
}
