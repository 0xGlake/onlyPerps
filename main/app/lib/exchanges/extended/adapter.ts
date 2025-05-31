// app/lib/exchanges/extended/adapter.ts
import {
  BaseExchange,
  ExchangeData,
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
        if (
          market.status !== "ACTIVE" ||
          parseFloat(market.marketStats.openInterest) === 0
        )
          continue;

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
      const formattedSymbol = symbol.endsWith("-USD")
        ? symbol
        : `${symbol}-USD`;

      const response = await this.api.getOrderBook(formattedSymbol);

      if (response.status !== "OK") {
        throw new Error(`API returned non-OK status: ${response.status}`);
      }

      const data = response.data;

      return {
        bids: data.bid.map(
          (level: any): OrderBookLevel => ({
            price: level.price,
            size: level.qty,
          }),
        ),
        asks: data.ask.map(
          (level: any): OrderBookLevel => ({
            price: level.price,
            size: level.qty,
          }),
        ),
        timestamp: Date.now(), // Extended API doesn't provide timestamp in orderbook
      };
    });
  }

  async getAllData(orderbookTickers: string[]): Promise<ExchangeData> {
    try {
      // Get ALL funding and open interest data
      const fundingData = await this.getFundingAndOI();

      // Get orderbooks only for specified tickers (individual API calls)
      const orderbookPromises = orderbookTickers.map(async (ticker) => {
        try {
          const orderbook = await this.getOrderBook(ticker);
          return { ticker, orderbook };
        } catch (error) {
          console.error("Error fetching data:", error);
          return { ticker, orderbook: null };
        }
      });

      const orderbookResults = await Promise.all(orderbookPromises);

      // Combine funding + orderbook data
      const result: ExchangeData = {};

      // Add ALL funding data (not just for orderbookTickers)
      for (const [symbol, funding] of Object.entries(fundingData)) {
        result[symbol] = {
          fundingData: funding,
        };
      }

      // Add orderbooks for the specific tickers
      for (const orderbookResult of orderbookResults) {
        if (result[orderbookResult.ticker]) {
          result[orderbookResult.ticker].orderBook =
            orderbookResult.orderbook || undefined;
        }
      }

      return result;
    } catch (error) {
      console.error("Error fetching data:", error);
      return {};
    }
  }
}
