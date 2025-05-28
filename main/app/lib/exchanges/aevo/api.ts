// app/lib/exchanges/aevo/api.ts

export class AevoAPI {
  private baseUrl = "https://api.aevo.xyz";
  private headers = { accept: "application/json" };

  async getMarkets() {
    const response = await fetch(`${this.baseUrl}/markets`, {
      method: "GET",
      headers: this.headers,
    });

    if (!response.ok) {
      throw new Error(`HTTP error ${response.status}: ${response.statusText}`);
    }

    return response.json();
  }

  async getInstrument(instrumentName: string) {
    const response = await fetch(
      `${this.baseUrl}/instrument/${instrumentName}`,
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

  async getOrderBook(instrumentName: string) {
    const response = await fetch(
      `${this.baseUrl}/orderbook?instrument_name=${instrumentName}`,
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

// Quick test - remove before production
async function testAPI() {
  const api = new AevoAPI();

  console.log("Testing markets endpoint...");
  try {
    const markets = await api.getMarkets();
    const activePerps = markets.filter(
      (m: any) => m.is_active && m.instrument_name.endsWith("-PERP"),
    );
    console.log(
      "✅ Markets success, found",
      activePerps.length,
      "active perpetuals",
    );
    console.log("Sample market:", JSON.stringify(activePerps[0], null, 2));
  } catch (error) {
    console.error("❌ Markets failed:", error);
  }

  console.log("\nTesting instrument data for ETH-PERP...");
  try {
    const instrument = await api.getInstrument("ETH-PERP");
    console.log("✅ Instrument success:");
    console.log("- Mark price:", instrument.mark_price);
    console.log("- Funding rate:", instrument.funding_rate);
    console.log("- Open interest:", instrument.markets?.total_oi);
    console.log("Full response:", JSON.stringify(instrument, null, 2));
  } catch (error) {
    console.error("❌ Instrument failed:", error);
  }

  console.log("\nTesting orderbook for ETH-PERP...");
  try {
    const orderbook = await api.getOrderBook("ETH-PERP");
    console.log("✅ Orderbook success:");
    console.log("- Top bid:", orderbook.bids?.[0]);
    console.log("- Top ask:", orderbook.asks?.[0]);
    console.log("- Timestamp:", orderbook.last_updated);
    console.log("Orderbook structure:", {
      bids: orderbook.bids?.length || 0,
      asks: orderbook.asks?.length || 0,
      keys: Object.keys(orderbook),
    });
  } catch (error) {
    console.error("❌ Orderbook failed:", error);
  }
}

testAPI();
