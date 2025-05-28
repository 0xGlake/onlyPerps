// app/lib/exchanges/hyperliquid/adapter.ts
import {
  BaseExchange,
  FundingData,
  OrderBook,
  OrderBookLevel,
} from "../base/exchange";
import { HyperliquidAPI } from "./api";

interface HyperMarket {
  name: string;
  funding: string;
  openInterest: string;
  premium: string;
}

export class HyperliquidExchange extends BaseExchange {
  name = "hyperliquid";
  private api = new HyperliquidAPI();

  async getFundingAndOI(): Promise<{ [key: string]: FundingData }> {
    return this.withRetry(async () => {
      const data = await this.api.getFundingAndOpenInterest();

      if (
        !Array.isArray(data[0]?.universe) ||
        !Array.isArray(data[1]) ||
        data[0].universe.length !== data[1].length
      ) {
        throw new Error("Unexpected data structure from Hyperliquid API");
      }

      const result: { [key: string]: FundingData } = {};

      // Get ALL assets, not just filtered tickers
      const universe = data[0].universe;
      const assetData = data[1];

      for (let i = 0; i < universe.length; i++) {
        const asset = universe[i];
        const associatedData = assetData[i];

        result[`${asset.name}-USD`] = {
          fundingRate: associatedData.funding,
          openInterest: associatedData.openInterest,
        };
      }

      console.log(
        `Retrieved funding data for ${Object.keys(result).length} assets from Hyperliquid`,
      );
      return result;
    });
  }

  async getOrderBook(symbol: string): Promise<OrderBook> {
    return this.withRetry(async () => {
      // Convert 'ETH-USD' to 'ETH' for Hyperliquid API
      const coin = symbol.replace("-USD", "");
      const data = await this.api.getOrderBook(coin);

      // Check if response has the expected structure
      if (
        !data ||
        !data.levels ||
        !Array.isArray(data.levels) ||
        data.levels.length !== 2
      ) {
        throw new Error(
          `Invalid orderbook response from Hyperliquid. Got: ${JSON.stringify(data)}`,
        );
      }

      const [bids, asks] = data.levels;

      return {
        bids: bids.map(
          (level: any): OrderBookLevel => ({
            price: level.px,
            size: level.sz,
            count: level.n,
          }),
        ),
        asks: asks.map(
          (level: any): OrderBookLevel => ({
            price: level.px,
            size: level.sz,
            count: level.n,
          }),
        ),
        timestamp: data.time || Date.now(),
      };
    });
  }

  // Combined method for your scheduler
  async getAllData(orderbookTickers: string[]) {
    try {
      // Get ALL funding and open interest data (one API call gets everything)
      const fundingData = await this.getFundingAndOI();

      // Get orderbooks only for specified tickers (individual API calls)
      const orderbookPromises = orderbookTickers.map(async (ticker) => {
        try {
          const orderbook = await this.getOrderBook(`${ticker}-USD`); // TODO: CHECK IF THIS IS PERP OR SPOT MARKET
          return { ticker: `${ticker}-USD`, orderbook };
        } catch (error) {
          console.error(`Error fetching orderbook for ${ticker}:`, error);
          return { ticker: `${ticker}-USD`, orderbook: null };
        }
      });

      const orderbookResults = await Promise.all(orderbookPromises);

      // Combine funding + orderbook data
      const result: { [key: string]: any } = {};

      // Add ALL funding data
      for (const [symbol, funding] of Object.entries(fundingData)) {
        result[symbol] = {
          ...funding,
          orderBook: null, // Default to no orderbook
        };
      }

      // Add orderbooks for the specific tickers
      for (const orderbookResult of orderbookResults) {
        if (result[orderbookResult.ticker]) {
          result[orderbookResult.ticker].orderBook = orderbookResult.orderbook;
        }
      }

      console.log(
        `Combined data: ${Object.keys(fundingData).length} funding rates, ${orderbookResults.filter((r) => r.orderbook).length} orderbooks`,
      );
      return result;
    } catch (error) {
      console.error("Error fetching Hyperliquid data:", error);
      return {};
    }
  }
}
