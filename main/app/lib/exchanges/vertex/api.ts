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

// Quick test - remove before production
async function testAPI() {
  const api = new VertexAPI();

  console.log("Testing funding and open interest data...");
  try {
    const contracts = await api.getFundingAndOpenInterest();
    console.log("✅ Contracts success, sample data:");
    const sampleTickers = Object.keys(contracts).slice(0, 2);
    sampleTickers.forEach((ticker) => {
      const data = contracts[ticker];
      console.log(`  ${ticker}:`);
      console.log(`    funding_rate: ${data.funding_rate}`);
      console.log(`    open_interest: ${data.open_interest}`);
      console.log(`    open_interest_usd: ${data.open_interest_usd}`);
    });
  } catch (error) {
    console.error("❌ Contracts failed:", error);
  }

  console.log("\nTesting orderbook...");
  try {
    const orderbook = await api.getOrderBook("ETH-PERP_USDC");
    console.log("✅ Orderbook success for ETH-PERP_USDC:");
    console.log(`  Timestamp: ${orderbook.timestamp}`);
    console.log(`  Bids count: ${orderbook.bids?.length || 0}`);
    console.log(`  Asks count: ${orderbook.asks?.length || 0}`);

    if (orderbook.bids && orderbook.bids.length > 0) {
      console.log(
        `  Best bid: ${orderbook.bids[0][0]} (${orderbook.bids[0][1]})`,
      );
    }
    if (orderbook.asks && orderbook.asks.length > 0) {
      console.log(
        `  Best ask: ${orderbook.asks[0][0]} (${orderbook.asks[0][1]})`,
      );
    }
  } catch (error) {
    console.error("❌ Orderbook failed:", error);
  }

  console.log("\nTesting orderbook for BTC...");
  try {
    const orderbook = await api.getOrderBook("BTC-PERP_USDC");
    console.log("✅ Orderbook success for BTC-PERP_USDC:");
    console.log(`  Timestamp: ${orderbook.timestamp}`);
    console.log(`  Bids count: ${orderbook.bids?.length || 0}`);
    console.log(`  Asks count: ${orderbook.asks?.length || 0}`);
  } catch (error) {
    console.error("❌ BTC Orderbook failed:", error);
  }
}

testAPI();
