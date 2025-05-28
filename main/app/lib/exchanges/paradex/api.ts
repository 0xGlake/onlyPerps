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

// Quick test - remove before production
async function testAPI() {
  const api = new ParadexAPI();

  console.log("Testing markets summary...");
  try {
    const summary = await api.getMarketsSummary();
    console.log(
      "✅ Markets summary success, total markets:",
      summary.results?.length,
    );
    console.log(
      "Sample market data:",
      JSON.stringify(summary.results?.[0], null, 2),
    );
  } catch (error) {
    console.error("❌ Markets summary failed:", error);
  }

  console.log("\nTesting orderbook...");
  try {
    const orderbook = await api.getOrderBook("BTC-USD-PERP");
    console.log("✅ Orderbook success for BTC-USD-PERP");
    console.log("Orderbook structure:", Object.keys(orderbook));
    console.log(
      "Bids:",
      orderbook.bids?.length,
      "Asks:",
      orderbook.asks?.length,
    );
    console.log("Sample bid:", orderbook.bids?.[0]);
    console.log("Sample ask:", orderbook.asks?.[0]);
  } catch (error) {
    console.error("❌ Orderbook failed:", error);
  }
}

testAPI();
