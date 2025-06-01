// tests/test-db-connection.ts
import { dbService } from "../app/lib/database-service";
import { HyperliquidExchange } from "../app/lib/exchanges/hyperliquid/adapter";
import { ExtendedExchange } from "../app/lib/exchanges/extended/adapter";
import { AevoExchange } from "../app/lib/exchanges/aevo/adapter";
import { ParadexExchange } from "../app/lib/exchanges/paradex/adapter";
import { DydxExchange } from "../app/lib/exchanges/dydx/adapter";
import { VertexExchange } from "../app/lib/exchanges/vertex/adapter";
import dotenv from "dotenv";

dotenv.config();

const TICKERS = ["ETH", "BTC", "SOL"];

// Initialize exchanges
const exchanges = {
  hyperliquid: new HyperliquidExchange(),
  extended: new ExtendedExchange(),
  aevo: new AevoExchange(),
  paradex: new ParadexExchange(),
  dydx: new DydxExchange(),
  vertex: new VertexExchange(),
};

async function fetchAndSaveExchangeData(exchangeName: string, exchange: any) {
  try {
    console.log(`\n📊 Fetching data from ${exchangeName}...`);
    const data = await exchange.getAllData(TICKERS);

    if (!data) {
      console.log(`⚠️  No data returned from ${exchangeName}`);
      return null;
    }

    console.log(`✅ Got data for ${Object.keys(data).length} symbols`);

    // Save to database
    console.time(`💾 Saving ${exchangeName} data`);
    await dbService.saveExchangeData(exchangeName, data);
    console.timeEnd(`💾 Saving ${exchangeName} data`);

    // Update collection status
    await dbService.updateCollectionStatus(exchangeName);

    return data;
  } catch (error) {
    console.error(`❌ Error with ${exchangeName}:`, error);
    await dbService.updateCollectionStatus(exchangeName, error as string);
    return null;
  }
}

async function testEndToEnd() {
  console.log(
    "🚀 Starting end-to-end database test with real exchange data...\n",
  );

  try {
    // 1. Fetch and save data from all exchanges
    console.log("═══════════════════════════════════════");
    console.log("📡 FETCHING REAL EXCHANGE DATA");
    console.log("═══════════════════════════════════════");

    const results = await Promise.all(
      Object.entries(exchanges).map(([name, exchange]) =>
        fetchAndSaveExchangeData(name, exchange),
      ),
    );

    // 2. Test ultra-fast queries
    console.log("\n═══════════════════════════════════════");
    console.log("⚡ TESTING ULTRA-FAST QUERIES");
    console.log("═══════════════════════════════════════");

    // Get all latest data
    console.time("⚡ Query all latest data");
    const allLatest = await dbService.getAllLatestData();
    console.timeEnd("⚡ Query all latest data");
    console.log(`✅ Retrieved ${allLatest.length} latest records`);

    // Get latest by exchange
    console.time("⚡ Query by exchange (hyperliquid)");
    const hyperliquidLatest = await dbService.getLatestData("hyperliquid");
    console.timeEnd("⚡ Query by exchange (hyperliquid)");
    console.log(`✅ Retrieved ${hyperliquidLatest.length} hyperliquid records`);

    // Get unique symbols
    console.time("⚡ Query unique symbols");
    const symbols = await dbService.getUniqueSymbols();
    console.timeEnd("⚡ Query unique symbols");
    console.log(`✅ Found ${symbols.length} unique symbols:`, symbols);

    // 3. Display summary
    console.log("\n═══════════════════════════════════════");
    console.log("📊 DATA SUMMARY");
    console.log("═══════════════════════════════════════");

    const formatted = dbService.formatDecimalFields(allLatest);
    const summary = formatted.reduce((acc: any, record: any) => {
      if (!acc[record.exchange]) acc[record.exchange] = [];
      acc[record.exchange].push({
        symbol: record.symbol,
        fundingRate: parseFloat(record.fundingRate),
        openInterest: parseFloat(record.openInterest),
        hasOrderBook: !!record.orderBook,
      });
      return acc;
    }, {});

    Object.entries(summary).forEach(([exchange, data]: [string, any]) => {
      console.log(`\n${exchange.toUpperCase()}:`);
      data.forEach((item: any) => {
        console.log(
          `  ${item.symbol}: FR=${item.fundingRate.toFixed(6)}, OI=$${(item.openInterest / 1000000).toFixed(2)}M${item.hasOrderBook ? " 📊" : ""}`,
        );
      });
    });

    // 4. Test collection health
    console.log("\n═══════════════════════════════════════");
    console.log("🏥 COLLECTION HEALTH");
    console.log("═══════════════════════════════════════");

    const health = await dbService.getCollectionHealth();
    health.forEach((status: any) => {
      const icon = status.consecutiveErrors > 0 ? "⚠️ " : "✅";
      console.log(
        `${icon} ${status.exchange}: ${status.consecutiveErrors} errors, last run: ${status.lastSuccessfulRun || "never"}`,
      );
    });

    // 5. Test historical data query
    console.log("\n═══════════════════════════════════════");
    console.log("📈 HISTORICAL DATA TEST");
    console.log("═══════════════════════════════════════");

    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    console.time("⚡ Query historical data");
    const historical = await dbService.getHistoricalData(
      "hyperliquid",
      "ETH-PERP",
      oneHourAgo,
      new Date(),
      10,
    );
    console.timeEnd("⚡ Query historical data");
    console.log(`✅ Found ${historical.length} historical records`);

    console.log("\n✨ End-to-end test completed successfully!");
    console.log("💡 Your database is ready for production use.");
  } catch (error) {
    console.error("\n❌ Test failed:", error);
    process.exit(1);
  } finally {
    await dbService.disconnect();
  }
}

// Run the test
testEndToEnd();
