// tests/test-exchanges-generic.ts - Generic test suite for any exchange

const {
  HyperliquidExchange,
} = require("../app/lib/exchanges/hyperliquid/adapter");
// Add new exchanges here:
const { ExtendedExchange } = require("../app/lib/exchanges/extended/adapter");
const { AevoExchange } = require("../app/lib/exchanges/aevo/adapter");
const { ParadexExchange } = require("../app/lib/exchanges/paradex/adapter");
const { DydxExchange } = require("../app/lib/exchanges/dydx/adapter");

const ORDERBOOK_TICKERS = ["ETH", "BTC", "SOL"];

async function testExchangeFunding(exchange: any) {
  console.log(
    `\n🔥 Testing ${exchange.name.toUpperCase()} Funding Rates & Open Interest (ALL assets)...`,
  );
  console.log("=".repeat(60));

  try {
    const fundingData = await exchange.getFundingAndOI();

    console.log(
      `✅ Success! Retrieved ${Object.keys(fundingData).length} assets from ${exchange.name}`,
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

    // Show funding stats
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
    console.error(`❌ ${exchange.name} funding test failed:`, error.message);
    return null;
  }
}

async function testExchangeOrderbooks(exchange: any, tickers: string[]) {
  console.log(
    `\n📚 Testing ${exchange.name.toUpperCase()} Order Books (${tickers.join(", ")})...`,
  );
  console.log("=".repeat(60));

  const results = [];

  for (const ticker of tickers) {
    try {
      console.log(`\n  Testing ${ticker} orderbook...`);
      const orderbook = await exchange.getOrderBook(`${ticker}-USD`); // this will cause issues, should have normalised inputs to be raw asset like "ETH"

      const topBid = orderbook.bids[0];
      const topAsk = orderbook.asks[0];
      const spread = parseFloat(topAsk.price) - parseFloat(topBid.price);
      const spreadBps = (spread / parseFloat(topBid.price)) * 10000;

      console.log(`  ✅ ${ticker}-USD:`);
      console.log(`     Top Bid: $${topBid.price} (${topBid.size} size)`);
      console.log(`     Top Ask: $${topAsk.price} (${topAsk.size} size)`);
      console.log(
        `     Spread:  $${spread.toFixed(4)} (${spreadBps.toFixed(2)} bps)`,
      );
      console.log(
        `     Levels:  ${orderbook.bids.length} bids, ${orderbook.asks.length} asks`,
      );
      console.log(
        `     Time:    ${new Date(orderbook.timestamp).toISOString()}`,
      );

      results.push({ ticker, success: true, orderbook });
    } catch (error: any) {
      console.error(`  ❌ ${ticker} orderbook failed:`, error.message);
      results.push({ ticker, success: false, error: error.message });
    }
  }

  return results;
}

async function testExchangeCombinedData(
  exchange: any,
  orderbookTickers: string[],
) {
  console.log(
    `\n🔄 Testing ${exchange.name.toUpperCase()} Combined getAllData Method...`,
  );
  console.log("=".repeat(60));

  try {
    const allData = await exchange.getAllData(orderbookTickers);

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
    for (const ticker of orderbookTickers) {
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
          !orderbookTickers.some((t) => symbol === `${t}-USD`),
      )
      .slice(0, 5);

    minorAssets.forEach(([symbol, data]: [string, any]) => {
      console.log(
        `  ${symbol}: Funding=${data.fundingRate}, OI=${data.openInterest}`,
      );
    });

    return allData;
  } catch (error: any) {
    console.error(`❌ ${exchange.name} combined test failed:`, error.message);
    return null;
  }
}

async function runExchangeTestSuite(
  exchange: any,
  orderbookTickers: string[] = ORDERBOOK_TICKERS,
) {
  console.log(`\n🧪 TESTING ${exchange.name.toUpperCase()} EXCHANGE`);
  console.log("=".repeat(50));

  const results = {
    exchange: exchange.name,
    funding: null as any,
    orderbooks: null as any,
    combined: null as any,
    success: false,
  };

  try {
    // Test funding rates
    results.funding = await testExchangeFunding(exchange);

    // Test orderbooks
    results.orderbooks = await testExchangeOrderbooks(
      exchange,
      orderbookTickers,
    );

    // Test combined data
    results.combined = await testExchangeCombinedData(
      exchange,
      orderbookTickers,
    );

    const fundingSuccess = !!results.funding;
    const orderbookSuccess =
      results.orderbooks?.some((r: any) => r.success) || false;
    const combinedSuccess = !!results.combined;

    console.log(`\n📊 ${exchange.name.toUpperCase()} TEST SUMMARY:`);
    console.log(`   Funding Rates: ${fundingSuccess ? "✅" : "❌"}`);
    console.log(`   Order Books:   ${orderbookSuccess ? "✅" : "❌"}`);
    console.log(`   Combined Data: ${combinedSuccess ? "✅" : "❌"}`);

    results.success = fundingSuccess && orderbookSuccess && combinedSuccess;

    if (results.success) {
      console.log(`🎉 ${exchange.name.toUpperCase()} INTEGRATION SUCCESSFUL!`);
    } else {
      console.log(
        `⚠️  ${exchange.name.toUpperCase()} has some issues - review above`,
      );
    }
  } catch (error: any) {
    console.error(
      `💥 ${exchange.name.toUpperCase()} test suite failed:`,
      error,
    );
    results.success = false;
  }

  return results;
}

async function testAllExchanges() {
  console.log("🚀 EXCHANGE INTEGRATION TEST SUITE");
  console.log("==================================");

  const exchanges = [
    new HyperliquidExchange(),
    // Add new exchanges here:
    new ExtendedExchange(),
    new AevoExchange(),
    new ParadexExchange(),
    new DydxExchange(),
  ];

  const allResults = [];

  for (const exchange of exchanges) {
    const result = await runExchangeTestSuite(exchange);
    allResults.push(result);
  }

  // Final summary
  console.log("\n🏁 FINAL SUMMARY");
  console.log("================");

  allResults.forEach((result) => {
    const status = result.success ? "✅" : "❌";
    console.log(
      `${status} ${result.exchange.toUpperCase()}: ${result.success ? "READY FOR PRODUCTION" : "NEEDS FIXES"}`,
    );
  });

  const successCount = allResults.filter((r) => r.success).length;
  console.log(
    `\n🎯 ${successCount}/${allResults.length} exchanges ready for deployment`,
  );

  if (successCount === allResults.length) {
    console.log("🚀 ALL EXCHANGES READY FOR AWS LAMBDA DEPLOYMENT!");
  }
}

// Run all tests
testAllExchanges();
