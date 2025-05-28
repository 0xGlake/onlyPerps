// app/lib/exchanges/extended/adapter.ts
import {
  BaseExchange,
  FundingData,
  OrderBook,
  OrderBookLevel,
} from "../base/exchange";
import { ExtendedAPI } from "./api";

export class ExtendedExchange extends BaseExchange {
  name = "extended";
  private api = new ExtendedAPI();

  async getFundingAndOI(): Promise<{ [key: string]: FundingData }> {
    return this.withRetry(async () => {
      const response = await this.api.getMarkets();

      if (response.status !== "OK") {
        throw new Error(`API returned non-OK status: ${response.status}`);
      }

      const result: { [key: string]: FundingData } = {};

      for (const market of response.data) {
        // Only include active markets
        if (market.status !== "ACTIVE") continue;

        result[market.name] = {
          fundingRate: market.marketStats.fundingRate,
          openInterest: market.marketStats.openInterest,
        };
      }

      return result;
    });
  }

  async getOrderBook(symbol: string): Promise<OrderBook> {
    return this.withRetry(async () => {
      const response = await this.api.getOrderBook(symbol);

      if (response.status !== "OK") {
        throw new Error(`API returned non-OK status: ${response.status}`);
      }

      const data = response.data;

      return {
        bids: data.bid.map(
          (level: any): OrderBookLevel => ({
            price: level.price,
            size: level.qty,
            count: 1, // Extended API doesn't provide count, so we default to 1
          }),
        ),
        asks: data.ask.map(
          (level: any): OrderBookLevel => ({
            price: level.price,
            size: level.qty,
            count: 1, // Extended API doesn't provide count, so we default to 1
          }),
        ),
        timestamp: Date.now(), // Extended API doesn't provide timestamp in orderbook
      };
    });
  }

  async getAllData(orderbookTickers: string[]) {
    const fundingData = await this.getFundingAndOI();
    const results: any = {};

    for (const ticker of orderbookTickers) {
      if (fundingData[ticker]) {
        try {
          const orderBook = await this.getOrderBook(ticker);
          results[ticker] = {
            fundingRate: fundingData[ticker].fundingRate,
            openInterest: fundingData[ticker].openInterest,
            orderBook,
          };
        } catch (error) {
          console.error(`Failed to get orderbook for ${ticker}:`, error);
          // Include funding data even if orderbook fails
          results[ticker] = {
            fundingRate: fundingData[ticker].fundingRate,
            openInterest: fundingData[ticker].openInterest,
            orderBook: null,
          };
        }
      }
    }

    return results;
  }
}
