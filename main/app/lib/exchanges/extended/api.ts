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

// Quick test - remove before production
async function testAPI() {
  const api = new ExtendedAPI();

  console.log("Testing markets data...");
  try {
    const markets = await api.getMarkets();
    console.log("✅ Markets success, status:", markets.status);
    console.log("Total markets:", markets.data?.length);
    if (markets.data?.[0]) {
      console.log("Sample market:", JSON.stringify(markets.data[0], null, 2));
    }
  } catch (error) {
    console.error("❌ Markets failed:", error);
  }

  console.log("\nTesting orderbook for BTC-USD...");
  try {
    const orderbook = await api.getOrderBook("BTC-USD");
    console.log("✅ Orderbook success, status:", orderbook.status);
    console.log("Orderbook structure:", Object.keys(orderbook.data || {}));
    if (orderbook.data) {
      console.log("Bid levels:", orderbook.data.bid?.length || 0);
      console.log("Ask levels:", orderbook.data.ask?.length || 0);
      console.log("Sample bid:", orderbook.data.bid?.[0]);
      console.log("Sample ask:", orderbook.data.ask?.[0]);
    }
  } catch (error) {
    console.error("❌ Orderbook failed:", error);
  }
}

testAPI();
