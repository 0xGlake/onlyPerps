// app/lib/exchanges/extended/api.ts
export class ExtendedAPI {
  private baseUrl = "https://api.extended.exchange/api/v1";

  async getMarkets() {
    const response = await fetch(`${this.baseUrl}/info/markets`);

    if (!response.ok) {
      throw new Error(`HTTP error ${response.status}: ${response.statusText}`);
    }

    return response.json();
  }

  async getOrderBook(market: string) {
    const response = await fetch(
      `${this.baseUrl}/info/markets/${market}/orderbook`,
    );

    if (!response.ok) {
      throw new Error(`HTTP error ${response.status}: ${response.statusText}`);
    }

    return response.json();
  }
}
