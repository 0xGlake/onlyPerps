// app/lib/exchanges/aevo/api.ts
export class AevoAPI {
  private baseUrl = "https://api.aevo.xyz";
  private headers = { accept: "application/json" };

  async getFundingAndOpenInterest() {
    const response = await fetch(`${this.baseUrl}/coingecko-statistics`, {
      method: "GET",
      headers: this.headers,
    });

    if (!response.ok) {
      throw new Error(`HTTP error ${response.status}: ${response.statusText}`);
    }

    return response.json();
  }

  async getOrderBook(instrumentName: string) {
    const url = new URL(`${this.baseUrl}/orderbook`);
    url.searchParams.append("instrument_name", instrumentName);

    const response = await fetch(url.toString(), {
      method: "GET",
      headers: this.headers,
    });

    if (!response.ok) {
      throw new Error(`HTTP error ${response.status}: ${response.statusText}`);
    }

    return response.json();
  }
}
