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
      }));

      const asks: OrderBookLevel[] = data.asks.map((level: string[]) => ({
        price: level[0],
        size: level[1],
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
      // Get ALL funding and open interest data
      const fundingData = await this.getFundingAndOI();

      // Get orderbooks only for specified tickers (individual API calls)
      const orderbookPromises = orderbookTickers.map(async (ticker) => {
        try {
          // Normalize ticker to ensure it has -USD suffix
          const normalizedTicker = ticker.includes("-USD")
            ? ticker
            : `${ticker}-USD`;
          const orderbook = await this.getOrderBook(normalizedTicker);
          return { ticker: normalizedTicker, orderbook };
        } catch (error) {
          console.error(`Error fetching orderbook for ${ticker}:`, error);
          const normalizedTicker = ticker.includes("-USD")
            ? ticker
            : `${ticker}-USD`;
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
      console.error("Error fetching Aevo data:", error);
      return {};
    }
  }
}
