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

// Quick test - remove before production
async function testAPI() {
  const api = new AevoAPI();

  console.log("Testing funding data...");
  try {
    const funding = await api.getFundingAndOpenInterest();
    console.log(
      "✅ Funding success, sample:",
      JSON.stringify(funding.slice(0, 2), null, 2),
    );
    console.log(`Total markets: ${funding.length}`);
  } catch (error) {
    console.error("❌ Funding failed:", error);
  }

  console.log("\nTesting orderbook for ETH-PERP...");
  try {
    const orderbook = await api.getOrderBook("ETH-PERP");
    console.log("✅ Orderbook success, structure:", Object.keys(orderbook));
    console.log("Top bid:", orderbook.bids?.[0]);
    console.log("Top ask:", orderbook.asks?.[0]);
  } catch (error) {
    console.error("❌ Orderbook failed:", error);
  }
}

testAPI();
