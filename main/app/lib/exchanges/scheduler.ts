// index.ts - AWS Lambda Entry Point with All Data Collection Logic
import redis from "../redis/client";
import { REDIS_KEYS } from "../redis/keys";

import { HyperliquidExchange } from "../exchanges/hyperliquid/adapter";
import { ExtendedExchange } from "./extended/adapter";
import { AevoExchange } from "./aevo/adapter";
import { ParadexExchange } from "./paradex/adapter";
import { DydxExchange } from "./dydx/adapter";
import { VertexExchange } from "./vertex/adapter";

import dotenv from "dotenv";
dotenv.config();

const TICKERS = ["ETH", "BTC", "SOL"];
const DATA_TTL = 3600; // 1 hour TTL (Lambda runs every 30 mins)

interface ExchangeData {
  dataHyperliquid: Record<string, any> | null;
  dataExtended: Record<string, any> | null;
  dataAevo: Record<string, any> | null;
  dataParadex: Record<string, any> | null;
  dataDydx: Record<string, any> | null;
  dataVertex: Record<string, any> | null;
}

// Initialize exchanges
const hyperliquid = new HyperliquidExchange();
const extended = new ExtendedExchange();
const aevo = new AevoExchange();
const paradex = new ParadexExchange();
const dydx = new DydxExchange();
const vertex = new VertexExchange();

export async function aggregate(): Promise<ExchangeData> {
  const promises = [
    hyperliquid.getAllData(TICKERS).catch((err) => {
      console.error("Error fetching data from Hyperliquid:", err);
      return null;
    }),
    extended.getAllData(TICKERS).catch((err) => {
      console.error("Error fetching data from Extended:", err);
      return null;
    }),
    aevo.getAllData(TICKERS).catch((err) => {
      console.error("Error fetching data from Aevo:", err);
      return null;
    }),
    paradex.getAllData(TICKERS).catch((err) => {
      console.error("Error fetching data from Paradex:", err);
      return null;
    }),
    dydx.getAllData(TICKERS).catch((err) => {
      console.error("Error fetching data from Dydx:", err);
      return null;
    }),
    vertex.getAllData(TICKERS).catch((err) => {
      console.error("Error fetching data from Vertex:", err);
      return null;
    }),
  ];

  const [
    dataHyperliquid,
    dataExtended,
    dataAevo,
    dataParadex,
    dataDydx,
    dataVertex,
  ] = await Promise.all(promises);

  return {
    dataHyperliquid,
    dataExtended,
    dataAevo,
    dataParadex,
    dataDydx,
    dataVertex,
  };
}

async function storeData(data: ExchangeData) {
  const pipeline = redis.pipeline();
  const timestamp = Date.now();

  // Store data
  if (data.dataHyperliquid) {
    await storeExchangeData("hyperliquid", data.dataHyperliquid, pipeline);
  }

  if (data.dataExtended) {
    await storeExchangeData("extended", data.dataExtended, pipeline);
  }

  if (data.dataAevo) {
    await storeExchangeData("aevo", data.dataAevo, pipeline);
  }

  if (data.dataParadex) {
    await storeExchangeData("paradex", data.dataParadex, pipeline);
  }

  if (data.dataDydx) {
    await storeExchangeData("dydx", data.dataDydx, pipeline);
  }

  if (data.dataVertex) {
    await storeExchangeData("vertex", data.dataVertex, pipeline);
  }

  // Update last successful update timestamp
  pipeline.set("last_successful_update", timestamp);
  pipeline.expire("last_successful_update", DATA_TTL);

  try {
    await pipeline.exec();
    console.log(
      `Successfully stored data to Redis at ${new Date(timestamp).toISOString()}`,
    );
  } catch (error) {
    console.error("Error storing data to Redis:", error);
    throw error;
  }
}

async function storeExchangeData(
  exchangeName: string,
  exchangeData: Record<string, any>,
  pipeline: any,
) {
  for (const [symbol, data] of Object.entries(exchangeData)) {
    // Store funding rate data
    if (data.fundingRate && data.openInterest) {
      const fundingKey = REDIS_KEYS.FUNDING(exchangeName, symbol);
      pipeline.set(
        fundingKey,
        JSON.stringify({
          fundingRate: data.fundingRate,
          openInterest: data.openInterest,
          timestamp: Date.now(),
        }),
      );
      pipeline.expire(fundingKey, DATA_TTL);
    }

    // Store orderbook data
    if (data.orderBook) {
      const orderbookKey = REDIS_KEYS.ORDERBOOK(exchangeName, symbol);
      pipeline.set(
        orderbookKey,
        JSON.stringify({
          ...data.orderBook,
          exchange: exchangeName,
          symbol: symbol,
        }),
      );
      pipeline.expire(orderbookKey, DATA_TTL);
    }
  }

  // Update exchange status
  const statusKey = REDIS_KEYS.EXCHANGE_STATUS(exchangeName);
  pipeline.set(
    statusKey,
    JSON.stringify({
      status: "active",
      lastUpdate: Date.now(),
      symbolCount: Object.keys(exchangeData).length,
    }),
  );
  pipeline.expire(statusKey, DATA_TTL);
}

// AWS Lambda Handler
export const handler = async (event: any, context: any) => {
  // Set Lambda timeout context
  context.callbackWaitsForEmptyEventLoop = false;

  try {
    console.log("Lambda function started - collecting exchange data...");

    // Aggregate data from all exchanges (same as your existing pattern)
    const exchangeData = await aggregate();

    // Store data to Redis (instead of Postgres)
    await storeData(exchangeData);

    console.log("Data collection completed successfully");

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: "Exchange data collection successful",
        timestamp: new Date().toISOString(),
        dataCollected: {
          hyperliquid: !!exchangeData.dataHyperliquid,
          extended: !!exchangeData.dataExtended,
          aevo: !!exchangeData.dataAevo,
          paradex: !!exchangeData.dataParadex,
          dydx: !!exchangeData.dataDydx,
          vertex: !!exchangeData.dataVertex,
        },
      }),
    };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error occurred";
    console.error("Lambda execution failed:", error);

    // Store error status in Redis for monitoring
    try {
      await redis.set(
        "collection_error",
        JSON.stringify({
          error: errorMessage,
          timestamp: Date.now(),
        }),
        "EX",
        300,
      );
    } catch (redisError) {
      console.error("Failed to store error in Redis:", redisError);
    }

    return {
      statusCode: 500,
      body: JSON.stringify({
        message: "Exchange data collection failed",
        error: errorMessage,
        timestamp: new Date().toISOString(),
      }),
    };
  }
};
