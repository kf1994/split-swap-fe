import { type Program } from "@coral-xyz/anchor"
import { type Pool } from "@types"
import type { LavarageIdl } from "@idls"
// import is from '@sindresorhus/is';
import {
  LAMPORTS_PER_SOL
  // PublicKey
} from "@solana/web3.js"
import { BigNumber } from "bignumber.js"
// import {
//   BN
// } from 'bn.js';

const serializePool = (data: any, programId: string) => {
  // if (!is.plainObject(data))
  //   throw TypeError(`Invalid data ${JSON.stringify(data)}`);
  const { publicKey, account } = data
  const programIdOfFirstSC = "CRSeeBqjDnm3UPefJ9gxrtngTsnQRhEJiTA345Q83X3v"
  const quoteCurrencyAddress =
    programId === programIdOfFirstSC ? "So11111111111111111111111111111111111111112" : data.account.qtType.toBase58()
  const quoteCurrencyUnitInToken = programId === programIdOfFirstSC ? LAMPORTS_PER_SOL : 10 ** 6

  return {
    apr: BigNumber(account.interestRate).div(100),
    baseCurrency: {
      address: account.collateralType.toBase58()
    },
    currentExposure: BigNumber(account.currentExposure.toString()).div(quoteCurrencyUnitInToken),
    maxBorrow: BigNumber(account.maxBorrow.toString()).div(quoteCurrencyUnitInToken),
    maxExposure: BigNumber(account.maxExposure.toString()).div(quoteCurrencyUnitInToken),
    nodeWallet: {
      publicKey: account.nodeWallet.toBase58()
    },
    programId,
    publicKey: publicKey.toBase58(),
    quoteCurrency: { address: quoteCurrencyAddress }
  } as Pool
}

export class PoolService {
  constructor(private program: Program<typeof LavarageIdl>) {}

  async getPools(): Promise<Pool[]> {
    const pools = await this.program.account.pool.all()

    // return pools.map(Pool.factory)
    return pools.map((pool) => serializePool(pool, this.program.programId.toBase58()))
  }

  async getPoolByKey(poolKey: string) {
    const pools = await this.program.account.pool.all()
    const pool = pools.find(({ publicKey }) => publicKey.toBase58() === poolKey)

    // return Pool.factory(pool)
    return serializePool(pool, this.program.programId.toBase58())
  }
}
