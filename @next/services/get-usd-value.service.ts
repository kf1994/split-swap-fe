
export async function getUsdWorth(amount: number, symbol: string): Promise<number> {
    if (!amount) return 0

    try {
        const res = await fetch(
            `https://api.coingecko.com/api/v3/simple/price?ids=${symbol}&vs_currencies=usd`
        )
        const data = await res.json()

        const price = data[symbol]?.usd || 0
        return amount * price
    } catch (error) {
        console.error("Error fetching price:", error)
        return 0
    }
}
