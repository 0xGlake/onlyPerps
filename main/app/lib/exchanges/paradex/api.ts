// app/lib/exchanges/paradex/api.ts
export class ParadexAPI {
  private baseUrl = "https://api.prod.paradex.trade/v1";
  private headers = { Accept: "application/json" };

  async getMarketsSummary() {
    const response = await fetch(`${this.baseUrl}/markets/summary?market=ALL`, {
      method: "GET",
      headers: this.headers,
    });

    if (!response.ok) {
      throw new Error(`HTTP error ${response.status}: ${response.statusText}`);
    }

    return response.json();
  }

  async getOrderBook(market: string) {
    const response = await fetch(`${this.baseUrl}/orderbook/${market}`, {
      method: "GET",
      headers: this.headers,
    });

    if (!response.ok) {
      throw new Error(`HTTP error ${response.status}: ${response.statusText}`);
    }

    return response.json();
  }
}
