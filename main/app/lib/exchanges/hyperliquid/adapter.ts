import { BaseExchange } from "../base/exchange";
import { FundingData, OrderBook, OrderBookLevel } from "../base/types";
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

  async getFundingAndOI(
    tickers: string[],
  ): Promise<{ [key: string]: FundingData }> {
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

      for (const ticker of tickers) {
        const index = data[0].universe.findIndex(
          (item: HyperMarket) => item.name === ticker,
        );
        if (index !== -1) {
          const associatedData = data[1][index];
          result[`${ticker}-USD`] = {
            fundingRate: associatedData.funding,
            openInterest: associatedData.openInterest,
          };
        }
      }

      if (Object.keys(result).length === 0) {
        console.warn(`No data found for tickers: ${tickers.join(", ")}`);
      }

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
  async getAllData(tickers: string[]) {
    try {
      const fundingData = await this.getFundingAndOI(tickers);

      // Get orderbooks for each ticker
      const orderbookPromises = tickers.map(async (ticker) => {
        try {
          const orderbook = await this.getOrderBook(`${ticker}-USD`);
          return { ticker: `${ticker}-USD`, orderbook };
        } catch (error) {
          console.error(`Error fetching orderbook for ${ticker}:`, error);
          return { ticker: `${ticker}-USD`, orderbook: null };
        }
      });

      const orderbookResults = await Promise.all(orderbookPromises);

      // Combine funding + orderbook data
      const result: { [key: string]: any } = {};
      for (const [symbol, funding] of Object.entries(fundingData)) {
        const orderbookResult = orderbookResults.find(
          (r) => r.ticker === symbol,
        );
        result[symbol] = {
          ...funding,
          orderBook: orderbookResult?.orderbook,
        };
      }

      return result;
    } catch (error) {
      console.error("Error fetching Hyperliquid data:", error);
      return {};
    }
  }
}
