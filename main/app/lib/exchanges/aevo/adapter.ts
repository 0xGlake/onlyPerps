// app/lib/exchanges/aevo/adapter.ts
import {
  BaseExchange,
  FundingData,
  OrderBook,
  OrderBookLevel,
  ExchangeData,
} from "../base/exchange";
import { AevoAPI } from "./api";

export class AevoExchange extends BaseExchange {
  name = "aevo";
  private api = new AevoAPI();

  async getFundingAndOI(): Promise<{ [key: string]: FundingData }> {
    return this.withRetry(async () => {
      const data = await this.api.getFundingAndOpenInterest();

      const result: { [key: string]: FundingData } = {};

      // Transform each market data, filtering out markets with 0 open interest
      for (const market of data) {
        // Skip markets with zero open interest
        if (parseFloat(market.open_interest) === 0) {
          continue;
        }

        // Convert ticker_id from XXX-PERP to XXX-USD
        const symbol = market.ticker_id.replace("-PERP", "-USD");

        result[symbol] = {
          fundingRate: market.funding_rate,
          openInterest: market.open_interest,
        };
      }

      return result;
    });
  }

  async getOrderBook(symbol: string): Promise<OrderBook> {
    return this.withRetry(async () => {
      // Convert symbol to XXX-PERP format for Aevo API
      let instrumentName: string;
      if (symbol.includes("-USD")) {
        // If symbol is XXX-USD, replace with XXX-PERP
        instrumentName = symbol.replace("-USD", "-PERP");
      } else if (symbol.includes("-PERP")) {
        // If already in PERP format, use as is
        instrumentName = symbol;
      } else {
        // If just the base symbol (e.g., "ETH"), append -PERP
        instrumentName = `${symbol}-PERP`;
      }

      const data = await this.api.getOrderBook(instrumentName);

      // Transform bid/ask arrays to OrderBookLevel objects
      const bids: OrderBookLevel[] = data.bids.map((level: string[]) => ({
        price: level[0],
        size: level[1],
        count: 1, // Aevo doesn't provide count, so we default to 1
      }));

      const asks: OrderBookLevel[] = data.asks.map((level: string[]) => ({
        price: level[0],
        size: level[1],
        count: 1, // Aevo doesn't provide count, so we default to 1
      }));

      return {
        bids,
        asks,
        timestamp: data.last_updated
          ? Math.floor(parseInt(data.last_updated) / 1000000)
          : Date.now(), // Convert nanoseconds to milliseconds
      };
    });
  }

  async getAllData(orderbookTickers: string[]): Promise<ExchangeData> {
    try {
      // Get funding and OI data for all markets
      const fundingData = await this.getFundingAndOI();

      // Initialize result with funding data
      const result: ExchangeData = {};
      for (const [symbol, data] of Object.entries(fundingData)) {
        result[symbol] = {
          fundingData: {
            fundingRate: data.fundingRate,
            openInterest: data.openInterest,
          },
        };
      }

      // Get orderbooks for requested tickers
      const orderBookPromises = orderbookTickers.map(async (ticker) => {
        try {
          // The ticker might be just "ETH" or "ETH-USD"
          // We need to ensure we use the right format for the result key
          const resultKey = ticker.includes("-USD") ? ticker : `${ticker}-USD`;
          const orderBook = await this.getOrderBook(ticker);
          return { ticker: resultKey, orderBook };
        } catch (error) {
          console.error(`Failed to get orderbook for ${ticker}:`, error);
          return null;
        }
      });

      const orderBookResults = await Promise.all(orderBookPromises);

      // Add orderbook data to results
      for (const orderBookResult of orderBookResults) {
        if (orderBookResult && result[orderBookResult.ticker]) {
          result[orderBookResult.ticker].orderBook = orderBookResult.orderBook;
        }
      }

      return result;
    } catch (error) {
      console.error("Error getting all data from Aevo:", error);
      throw error;
    }
  }
}
