// app/lib/exchanges/dydx/api.ts
export class DydxAPI {
  private baseUrl = "https://indexer.dydx.trade/v4";
  private headers = { "Content-Type": "application/json" };

  async getFundingAndOpenInterest() {
    const response = await fetch(`${this.baseUrl}/perpetualMarkets`, {
      method: "GET",
      headers: this.headers,
    });

    if (!response.ok) {
      throw new Error(`HTTP error ${response.status}: ${response.statusText}`);
    }

    return response.json();
  }

  async getOrderBook(ticker: string) {
    const response = await fetch(
      `${this.baseUrl}/orderbooks/perpetualMarket/${ticker}`,
      {
        method: "GET",
        headers: this.headers,
      },
    );

    if (!response.ok) {
      throw new Error(`HTTP error ${response.status}: ${response.statusText}`);
    }

    return response.json();
  }
}
