import { type NodeWallet } from "@types"
import { BaseService } from "./base-service"
import { API_HOST } from "@config"

export class NodeWalletService extends BaseService {
  private nodeWallets: NodeWallet[] = []
  private cacheTimestamp = 0

  async getNodeWallets(): Promise<NodeWallet[]> {
    if (Date.now() - this.cacheTimestamp < 1000 * 30) {
      return this.nodeWallets
    }

    const nodeWallets = (await this.http.get(`${API_HOST}/node-wallets/list`))?.data?.data
    this.nodeWallets = nodeWallets
    this.cacheTimestamp = Date.now()

    return nodeWallets
  }
}

export const nodeWalletService = new NodeWalletService()
