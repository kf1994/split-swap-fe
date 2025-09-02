import { PROGRAM_ID } from "@config"
import { web3 } from "@coral-xyz/anchor"
import { PublicKey } from "@solana/web3.js"
import { Buffer } from "buffer"

export function getPda(seed: Buffer | Buffer[], programId = PROGRAM_ID) {
  const seedsBuffer = Array.isArray(seed) ? seed : [seed]
  return web3.PublicKey.findProgramAddressSync(
    seedsBuffer,
    new PublicKey(programId)
  )[0]
}
