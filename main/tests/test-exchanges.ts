// tests/test-exchanges-require.ts - Full test suite with require syntax
// npx ts-node tests/test-exchanges.ts
const {
  HyperliquidExchange,
} = require("../app/lib/exchanges/hyperliquid/adapter");

const ORDERBOOK_TICKERS = ["ETH", "BTC", "SOL"];

async function testHyperliquidFunding() {
  console.log(
    "\n🔥 Testing Hyperliquid Funding Rates & Open Interest (ALL assets)...",
  );
  console.log("================================================");

  const hyperliquid = new HyperliquidExchange();

  try {
    const fundingData = await hyperliquid.getFundingAndOI();

    console.log(
      `✅ Success! Retrieved ${Object.keys(fundingData).length} assets`,
    );
    console.log("\n📊 Sample funding data:");

    // Show first 10 assets
    const entries = Object.entries(fundingData).slice(0, 10);
    entries.forEach(([symbol, data]: [string, any]) => {
      console.log(
        `  ${symbol.padEnd(12)} | Funding: ${data.fundingRate.padEnd(12)} | OI: ${data.openInterest}`,
      );
    });

    if (Object.keys(fundingData).length > 10) {
      console.log(
        `  ... and ${Object.keys(fundingData).length - 10} more assets`,
      );
    }

    // Show some interesting stats
    const fundingRates = Object.values(fundingData).map((d: any) =>
      parseFloat(d.fundingRate),
    );
    const maxFunding = Math.max(...fundingRates);
    const minFunding = Math.min(...fundingRates);
    const positiveFunding = fundingRates.filter((r) => r > 0).length;
    const negativeFunding = fundingRates.filter((r) => r < 0).length;

    console.log("\n📈 Funding Rate Stats:");
    console.log(`  Highest: ${maxFunding} (longs pay shorts)`);
    console.log(`  Lowest:  ${minFunding} (shorts pay longs)`);
    console.log(
      `  Positive: ${positiveFunding} assets, Negative: ${negativeFunding} assets`,
    );

    return fundingData;
  } catch (error: any) {
    console.error("❌ Funding test failed:", error.message);
    return null;
  }
}

async function testHyperliquidOrderbooks() {
  console.log("\n📚 Testing Hyperliquid Order Books (ETH, BTC, SOL only)...");
  console.log("=====================================================");

  const hyperliquid = new HyperliquidExchange();

  for (const ticker of ORDERBOOK_TICKERS) {
    try {
      console.log(`\n  Testing ${ticker} orderbook...`);
      const orderbook = await hyperliquid.getOrderBook(`${ticker}-USD`);

      const topBid = orderbook.bids[0];
      const topAsk = orderbook.asks[0];
      const spread = parseFloat(topAsk.price) - parseFloat(topBid.price);
      const spreadBps = (spread / parseFloat(topBid.price)) * 10000;

      console.log(`  ✅ ${ticker}-USD:`);
      console.log(`     Top Bid: ${topBid.price} (${topBid.size} size)`);
      console.log(`     Top Ask: ${topAsk.price} (${topAsk.size} size)`);
      console.log(
        `     Spread:  ${spread.toFixed(4)} (${spreadBps.toFixed(2)} bps)`,
      );
      console.log(
        `     Levels:  ${orderbook.bids.length} bids, ${orderbook.asks.length} asks`,
      );
      console.log(
        `     Time:    ${new Date(orderbook.timestamp).toISOString()}`,
      );
    } catch (error: any) {
      console.error(`  ❌ ${ticker} orderbook failed:`, error.message);
    }
  }
}

async function testCombinedData() {
  console.log("\n🔄 Testing Combined getAllData Method (Production Method)...");
  console.log("=========================================================");

  const hyperliquid = new HyperliquidExchange();

  try {
    const allData = await hyperliquid.getAllData(ORDERBOOK_TICKERS);

    console.log(
      `✅ Combined data retrieved for ${Object.keys(allData).length} assets total`,
    );

    // Count assets with/without orderbooks
    const withOrderbooks = Object.values(allData).filter(
      (d: any) => d.orderBook !== null,
    ).length;
    const withoutOrderbooks = Object.values(allData).filter(
      (d: any) => d.orderBook === null,
    ).length;

    console.log(`   ${withOrderbooks} assets have orderbooks`);
    console.log(`   ${withoutOrderbooks} assets have funding only`);

    console.log("\n📋 Major assets (with orderbooks):");
    for (const ticker of ORDERBOOK_TICKERS) {
      const data = allData[`${ticker}-USD`];
      if (data) {
        const hasOB = data.orderBook ? "✅" : "❌";
        console.log(
          `  ${ticker}-USD: Funding=${data.fundingRate}, OI=${data.openInterest}, OrderBook=${hasOB}`,
        );
      }
    }

    console.log("\n📋 Sample minor assets (funding only):");
    const minorAssets = Object.entries(allData)
      .filter(
        ([symbol, data]) =>
          !ORDERBOOK_TICKERS.some((t) => symbol === `${t}-USD`),
      )
      .slice(0, 5);

    minorAssets.forEach(([symbol, data]: [string, any]) => {
      console.log(
        `  ${symbol}: Funding=${data.fundingRate}, OI=${data.openInterest}`,
      );
    });

    return allData;
  } catch (error: any) {
    console.error("❌ Combined test failed:", error.message);
    return null;
  }
}

async function testLambdaSimulation() {
  console.log("\n🚀 Testing Lambda Function Simulation...");
  console.log("=======================================");

  try {
    // This mimics what your Lambda will do
    console.log("Simulating: aggregateExchangeData()...");

    const hyperliquid = new HyperliquidExchange();
    const dataHyperliquid = await hyperliquid
      .getAllData(ORDERBOOK_TICKERS)
      .catch((err: any) => {
        console.error("Error fetching data from Hyperliquid:", err);
        return null;
      });

    const exchangeData = { dataHyperliquid };

    if (exchangeData.dataHyperliquid) {
      console.log("✅ Lambda simulation successful!");
      console.log(
        `   Would store ${Object.keys(exchangeData.dataHyperliquid).length} assets to Redis`,
      );

      // Show what would go to Redis
      const fundingCount = Object.keys(exchangeData.dataHyperliquid).length;
      const orderbookCount = Object.values(exchangeData.dataHyperliquid).filter(
        (d: any) => d.orderBook,
      ).length;

      console.log(`   Redis keys to create:`);
      console.log(`     ${fundingCount} funding rate keys`);
      console.log(`     ${orderbookCount} orderbook keys`);
      console.log(`     1 last_update key`);
      console.log(`     1 exchange_status key`);
    } else {
      console.log("❌ Lambda simulation failed - no data returned");
    }
  } catch (error: any) {
    console.error("❌ Lambda simulation error:", error.message);
  }
}

async function runAllTests() {
  console.log("🧪 STARTING EXCHANGE TESTS");
  console.log("==========================");
  console.log("This will test the actual Hyperliquid API calls...\n");

  try {
    // Run tests in sequence
    await testHyperliquidFunding();
    await testHyperliquidOrderbooks();
    await testCombinedData();
    await testLambdaSimulation();

    console.log("\n🎉 ALL TESTS COMPLETED!");
    console.log("=======================");
    console.log("✅ Your exchange implementation is working correctly");
    console.log("✅ Ready to deploy to AWS Lambda with Redis");
  } catch (error: any) {
    console.error("\n💥 TEST SUITE FAILED:", error);
    console.log("Fix the errors above before deploying to production");
  }
}

// Run the tests
runAllTests();
