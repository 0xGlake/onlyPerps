// app/lib/exchanges/vertex/api.ts
export class VertexAPI {
  private baseUrl = "https://archive.prod.vertexprotocol.com/v2";
  private baseUrlGateway = "https://gateway.prod.vertexprotocol.com/v2";

  async getFundingAndOpenInterest() {
    const response = await fetch(`${this.baseUrl}/contracts`, {
      headers: {
        accept: "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error ${response.status}: ${response.statusText}`);
    }

    return response.json();
  }

  async getOrderBook(tickerId: string, depth: number = 30) {
    const response = await fetch(
      `${this.baseUrlGateway}/orderbook?ticker_id=${tickerId}&depth=${depth}`,
      {
        headers: {
          accept: "application/json",
        },
      },
    );

    if (!response.ok) {
      throw new Error(`HTTP error ${response.status}: ${response.statusText}`);
    }

    return response.json();
  }
}
