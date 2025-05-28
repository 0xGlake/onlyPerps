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

  async getFundingAndOI(
    tickers?: string[],
  ): Promise<{ [key: string]: FundingData }> {
    return this.withRetry(async () => {
      // Get all markets first
      const markets = await this.api.getMarkets();

      // Filter for active perpetuals
      const activePerps = markets.filter(
        (market: any) =>
          market.is_active && market.instrument_name.endsWith("-PERP"),
      );

      const result: { [key: string]: FundingData } = {};

      // For each active perpetual, get its funding and OI data
      const promises = activePerps.map(async (market: any) => {
        try {
          const instrument = await this.api.getInstrument(
            market.instrument_name,
          );

          // Keep the -PERP format
          result[market.instrument_name] = {
            fundingRate: instrument.funding_rate || "0",
            openInterest: instrument.markets?.total_oi || "0",
          };
        } catch (error) {
          console.warn(
            `Failed to get data for ${market.instrument_name}:`,
            error,
          );
        }
      });

      // Wait for all requests to complete
      await Promise.all(promises);

      // If tickers are specified (e.g., ["ETH", "BTC"]), filter for those -PERP markets
      if (tickers && tickers.length > 0) {
        const filteredResult: { [key: string]: FundingData } = {};
        for (const ticker of tickers) {
          const perpSymbol = `${ticker}-PERP`;
          if (result[perpSymbol]) {
            filteredResult[perpSymbol] = result[perpSymbol];
          }
        }
        return filteredResult;
      }

      return result;
    });
  }

  async getOrderBook(symbol: string): Promise<OrderBook> {
    return this.withRetry(async () => {
      // If symbol doesn't end with -PERP, append it
      const instrumentName = symbol.endsWith("-PERP")
        ? symbol
        : `${symbol}-PERP`;

      const data = await this.api.getOrderBook(instrumentName);

      // Transform the orderbook data
      return {
        bids: data.bids.map(
          (level: any): OrderBookLevel => ({
            price: level[0],
            size: level[1],
            count: 1, // Aevo doesn't provide count, so we default to 1
          }),
        ),
        asks: data.asks.map(
          (level: any): OrderBookLevel => ({
            price: level[0],
            size: level[1],
            count: 1, // Aevo doesn't provide count, so we default to 1
          }),
        ),
        timestamp: parseInt(data.last_updated) / 1000000 || Date.now(), // Convert nanoseconds to milliseconds
      };
    });
  }

  async getAllData(orderbookTickers: string[]): Promise<ExchangeData> {
    return this.withRetry(async () => {
      // Get funding and OI for all markets
      const fundingData = await this.getFundingAndOI();

      const result: ExchangeData = {};

      // Add funding data to result
      for (const [symbol, data] of Object.entries(fundingData)) {
        result[symbol] = {
          fundingRate: data.fundingRate,
          openInterest: data.openInterest,
        };
      }

      // Get orderbook data for specified tickers (e.g., ["ETH", "BTC", "SOL"])
      if (orderbookTickers && orderbookTickers.length > 0) {
        const orderbookPromises = orderbookTickers.map(async (ticker) => {
          try {
            // Append -PERP to the ticker
            const perpSymbol = `${ticker}-PERP`;
            const orderbook = await this.getOrderBook(ticker); // getOrderBook will handle appending -PERP

            if (result[perpSymbol]) {
              result[perpSymbol].orderBook = orderbook;
            } else {
              result[perpSymbol] = {
                fundingRate: "0",
                openInterest: "0",
                orderBook: orderbook,
              };
            }
          } catch (error) {
            console.warn(`Failed to get orderbook for ${ticker}:`, error);
          }
        });

        await Promise.all(orderbookPromises);
      }

      return result;
    });
  }
}
