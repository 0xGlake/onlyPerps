export class HyperliquidAPI {
  private baseUrl = "https://api.hyperliquid.xyz/info";
  private headers = { "Content-Type": "application/json" };

  async getFundingAndOpenInterest() {
    const response = await fetch(this.baseUrl, {
      method: "POST",
      headers: this.headers,
      body: JSON.stringify({ type: "metaAndAssetCtxs" }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error ${response.status}: ${response.statusText}`);
    }

    return response.json();
  }

  async getOrderBook(coin: string) {
    const response = await fetch(this.baseUrl, {
      method: "POST",
      headers: this.headers,
      body: JSON.stringify({
        type: "l2Book",
        coin: coin,
        nSigFigs: null, // Full precision
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error ${response.status}: ${response.statusText}`);
    }

    return response.json();
  }
}
