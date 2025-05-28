// app/lib/exchanges/paradex/adapter.ts
import {
  BaseExchange,
  FundingData,
  OrderBook,
  OrderBookLevel,
} from "../base/exchange";
import { ParadexAPI } from "./api";

interface HyperMarket {
  name: string;
  funding: string;
  openInterest: string;
  premium: string;
}

export class ParadexExchange extends BaseExchange {
  name = "paradex";
  private api = new ParadexAPI();

  async getFundingAndOI(): Promise<{ [key: string]: FundingData }> {
    return this.withRetry(async () => {
      const data = await this.api.getMarketsSummary();

      const result: { [key: string]: FundingData } = {};

      // Filter for perpetual markets only (ending with -PERP)
      const perpMarkets = data.results.filter(
        (market: any) => market.symbol && market.symbol.endsWith("-PERP"),
      );

      for (const market of perpMarkets) {
        // Convert symbol format: "BTC-USD-PERP" -> "BTC-USD"
        const standardSymbol = market.symbol.replace("-PERP", "");

        // Only add if we have funding rate and open interest
        if (
          market.funding_rate !== undefined &&
          market.open_interest !== undefined
        ) {
          result[standardSymbol] = {
            fundingRate: market.funding_rate,
            openInterest: market.open_interest,
          };
        }
      }

      return result;
    });
  }

  async getOrderBook(symbol: string): Promise<OrderBook> {
    return this.withRetry(async () => {
      // Convert symbol format: "BTC-USD" -> "BTC-USD-PERP"
      const paradexSymbol = `${symbol}-PERP`;
      const data = await this.api.getOrderBook(paradexSymbol);

      // Transform bid/ask arrays to standard format
      const transformLevel = (level: any[]): OrderBookLevel => ({
        price: level[0],
        size: level[1],
        count: 1, // Paradex doesn't provide order count, default to 1
      });

      return {
        bids: data.bids.map(transformLevel),
        asks: data.asks.map(transformLevel),
        timestamp: data.last_updated_at || Date.now(),
      };
    });
  }

  async getAllData(orderbookTickers: string[]) {
    try {
      // Get funding and OI data for all markets
      const fundingData = await this.getFundingAndOI();

      // Get orderbook data for specified tickers
      const orderbookPromises = orderbookTickers.map(async (ticker) => {
        try {
          const orderbook = await this.getOrderBook(ticker);
          return { ticker, orderbook };
        } catch (error) {
          console.error(`Failed to get orderbook for ${ticker}:`, error);
          return null;
        }
      });

      const orderbookResults = await Promise.all(orderbookPromises);

      // Combine all data
      const result: any = {};

      // Add funding data
      for (const [ticker, data] of Object.entries(fundingData)) {
        result[ticker] = { ...data };
      }

      // Add orderbook data
      for (const orderbookResult of orderbookResults) {
        if (orderbookResult && result[orderbookResult.ticker]) {
          result[orderbookResult.ticker].orderBook = orderbookResult.orderbook;
        }
      }

      return result;
    } catch (error) {
      console.error("Error getting all data from Paradex:", error);
      throw error;
    }
  }
}
