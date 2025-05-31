// app/lib/exchanges/dydx/adapter.ts
import {
  BaseExchange,
  FundingData,
  OrderBook,
  OrderBookLevel,
  ExchangeData,
} from "../base/exchange";
import { DydxAPI } from "./api";

export class DydxExchange extends BaseExchange {
  name = "dydx";
  private api = new DydxAPI();

  async getFundingAndOI(): Promise<{ [key: string]: FundingData }> {
    return this.withRetry(async () => {
      const data = await this.api.getFundingAndOpenInterest();
      const result: { [key: string]: FundingData } = {};

      // Process all markets from the response
      for (const [marketId, market] of Object.entries(data.markets || {})) {
        const marketData = market as any;

        // dydx already uses ticker format like "BTC-USD"
        const ticker = marketData.ticker;

        result[ticker] = {
          fundingRate: marketData.nextFundingRate,
          openInterest: marketData.openInterest,
        };
      }

      return result;
    });
  }

  async getOrderBook(symbol: string): Promise<OrderBook> {
    return this.withRetry(async () => {
      // Handle both "ETH" and "ETH-USD" formats
      const ticker = symbol.includes("-") ? symbol : `${symbol}-USD`;
      const data = await this.api.getOrderBook(ticker);

      // Transform bids and asks to standard format
      const bids: OrderBookLevel[] = (data.bids || []).map((level: any) => ({
        price: level.price,
        size: level.size,
        count: 1, // dydx doesn't provide count, default to 1
      }));

      const asks: OrderBookLevel[] = (data.asks || []).map((level: any) => ({
        price: level.price,
        size: level.size,
        count: 1, // dydx doesn't provide count, default to 1
      }));

      return {
        bids,
        asks,
        timestamp: Date.now(), // dydx doesn't provide timestamp in orderbook response
      };
    });
  }

  async getAllData(orderbookTickers: string[]): Promise<ExchangeData> {
    return this.withRetry(async () => {
      // Normalize tickers to include -USD suffix
      const normalizedTickers = orderbookTickers.map((ticker) =>
        ticker.includes("-") ? ticker : `${ticker}-USD`,
      );

      // Get funding and OI data for all tickers
      const fundingData = await this.getFundingAndOI();

      // Build the result object
      const result: ExchangeData = {};

      // Get orderbook for each requested ticker
      for (const ticker of normalizedTickers) {
        if (fundingData[ticker]) {
          try {
            const orderBook = await this.getOrderBook(ticker);
            result[ticker] = {
              fundingData: fundingData[ticker],
              orderBook,
            };
          } catch (error) {
            console.warn(`Failed to get orderbook for ${ticker}:`, error);
            // Include funding data even if orderbook fails
            result[ticker] = {
              fundingData: fundingData[ticker],
              orderBook: {
                bids: [],
                asks: [],
                timestamp: Date.now(),
              },
            };
          }
        }
      }

      return result;
    });
  }
}
