// app/lib/exchanges/drift/adapter.ts
import {
  BaseExchange,
  FundingData,
  OrderBook,
  OrderBookLevel,
  ExchangeData,
} from "../base/exchange";
import { DriftAPI } from "./api";

export class DriftExchange extends BaseExchange {
  name = "drift";
  private api = new DriftAPI();

  async getFundingAndOI(): Promise<{ [key: string]: FundingData }> {
    return this.withRetry(async () => {
      const data = await this.api.getFundingAndOpenInterest();

      const result: { [key: string]: FundingData } = {};

      if (data.contracts && Array.isArray(data.contracts)) {
        for (const contract of data.contracts) {
          // Convert base_currency to standard format (e.g., "SOL" -> "SOL-USD")
          const symbol = `${contract.base_currency}-USD`;

          result[symbol] = {
            fundingRate: contract.funding_rate,
            openInterest: contract.open_interest,
          };
        }
      }

      return result;
    });
  }

  async getOrderBook(symbol: string): Promise<OrderBook> {
    return this.withRetry(async () => {
      // Convert symbol format: "ETH-USD" -> "ETH-PERP"
      const marketName = symbol.replace("-USD", "-PERP");
      const data = await this.api.getOrderBook(marketName);

      const PRICE_DIVISOR = 1000000;
      const SIZE_DIVISOR = 1000000000;

      const bids: OrderBookLevel[] = data.bids
        ? data.bids.map((bid: any) => ({
            price: (parseFloat(bid.price) / PRICE_DIVISOR).toString(),
            size: (parseFloat(bid.size) / SIZE_DIVISOR).toString(),
            count: 1,
          }))
        : [];

      const asks: OrderBookLevel[] = data.asks
        ? data.asks.map((ask: any) => ({
            price: (parseFloat(ask.price) / PRICE_DIVISOR).toString(),
            size: (parseFloat(ask.size) / SIZE_DIVISOR).toString(),
            count: 1,
          }))
        : [];

      return {
        bids,
        asks,
        timestamp: data.ts || Date.now(),
      };
    });
  }

  async getAllData(orderbookTickers: string[]): Promise<ExchangeData> {
    try {
      // Get funding and OI data for all symbols
      const fundingData = await this.getFundingAndOI();

      const result: ExchangeData = {};

      // Process each requested ticker
      for (const ticker of orderbookTickers) {
        // Normalize ticker format: "ETH" -> "ETH-USD" or keep "ETH-USD" as is
        const normalizedTicker = ticker.includes("-")
          ? ticker
          : `${ticker}-USD`;

        try {
          // Get orderbook for this ticker
          const orderBook = await this.getOrderBook(normalizedTicker);

          // Only include if we have funding data for this symbol
          if (fundingData[normalizedTicker]) {
            result[normalizedTicker] = {
              fundingRate: fundingData[normalizedTicker].fundingRate,
              openInterest: fundingData[normalizedTicker].openInterest,
              orderBook: orderBook,
            };
          }
        } catch (error) {
          console.warn(
            `Failed to get orderbook for ${normalizedTicker}:`,
            error,
          );
          // Continue with other symbols
        }
      }

      return result;
    } catch (error) {
      console.error("Error in getAllData:", error);
      throw error;
    }
  }
}
