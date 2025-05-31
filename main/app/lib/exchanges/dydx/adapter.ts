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

        if (marketData.openInterest == 0) {
          continue;
        }

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
      }));

      const asks: OrderBookLevel[] = (data.asks || []).map((level: any) => ({
        price: level.price,
        size: level.size,
      }));

      return {
        bids,
        asks,
        timestamp: Date.now(), // dydx doesn't provide timestamp in orderbook response
      };
    });
  }

  async getAllData(orderbookTickers: string[]): Promise<ExchangeData> {
    try {
      // Get ALL funding and open interest data
      const fundingData = await this.getFundingAndOI();

      // Normalize tickers and get orderbooks only for specified tickers (individual API calls)
      const orderbookPromises = orderbookTickers.map(async (ticker) => {
        const normalizedTicker = ticker.includes("-")
          ? ticker
          : `${ticker}-USD`;
        try {
          const orderbook = await this.getOrderBook(normalizedTicker);
          return { ticker: normalizedTicker, orderbook };
        } catch (error) {
          console.error(
            `Error fetching orderbook for ${normalizedTicker}:`,
            error,
          );
          return { ticker: normalizedTicker, orderbook: null };
        }
      });

      const orderbookResults = await Promise.all(orderbookPromises);

      // Combine funding + orderbook data
      const result: ExchangeData = {};

      // Add ALL funding data
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
