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
          if (
            !contract.ticker_id.endsWith("-PERP") ||
            contract.open_interest === 0
          ) {
            continue;
          }

          const symbol = contract.ticker_id.replace("-PERP", "-USD");

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
      const SIZE_DIVISOR = 1000000;

      const bids: OrderBookLevel[] = data.bids
        ? data.bids.map((bid: any) => ({
            price: (parseFloat(bid.price) / PRICE_DIVISOR).toString(),
            size: (parseFloat(bid.size) / SIZE_DIVISOR).toString(),
          }))
        : [];

      const asks: OrderBookLevel[] = data.asks
        ? data.asks.map((ask: any) => ({
            price: (parseFloat(ask.price) / PRICE_DIVISOR).toString(),
            size: (parseFloat(ask.size) / SIZE_DIVISOR).toString(),
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
      // Get ALL funding and open interest data
      const fundingData = await this.getFundingAndOI();

      // Get orderbooks only for specified tickers (individual API calls)
      const orderbookPromises = orderbookTickers.map(async (ticker) => {
        try {
          // Normalize ticker format: "ETH" -> "ETH-USD" or keep "ETH-USD" as is
          const normalizedTicker = ticker.includes("-")
            ? ticker
            : `${ticker}-USD`;
          const orderbook = await this.getOrderBook(normalizedTicker);
          return { ticker: normalizedTicker, orderbook };
        } catch (error) {
          // Normalize ticker for error case too
          const normalizedTicker = ticker.includes("-")
            ? ticker
            : `${ticker}-USD`;
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
