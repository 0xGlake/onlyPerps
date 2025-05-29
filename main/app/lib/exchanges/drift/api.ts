// app/lib/exchanges/drift/api.ts
export class DriftAPI {
  private contractsUrl = "https://data.api.drift.trade/contracts";
  private orderbookUrl = "https://dlob.drift.trade/l2";
  private headers = { "Content-Type": "application/json" };

  async getFundingAndOpenInterest() {
    const response = await fetch(this.contractsUrl, {
      method: "GET",
      headers: this.headers,
    });

    if (!response.ok) {
      throw new Error(`HTTP error ${response.status}: ${response.statusText}`);
    }

    return response.json();
  }

  async getOrderBook(marketName: string) {
    const params = new URLSearchParams({
      marketName: marketName,
      depth: "30",
      includeOracle: "true",
      includeVamm: "true",
    });

    const response = await fetch(`${this.orderbookUrl}?${params.toString()}`, {
      method: "GET",
      headers: this.headers,
    });

    if (!response.ok) {
      throw new Error(`HTTP error ${response.status}: ${response.statusText}`);
    }

    return response.json();
  }
}
