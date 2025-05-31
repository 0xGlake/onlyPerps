// app/lib/exchanges/vertex/adapter.ts
import {
  BaseExchange,
  FundingData,
  OrderBook,
  OrderBookLevel,
  ExchangeData,
} from "../base/exchange";
import { VertexAPI } from "./api";

export class VertexExchange extends BaseExchange {
  name = "vertex";
  private api = new VertexAPI();

  // Convert standard symbol (ETH-USD, ETH) to Vertex format (ETH-PERP_USDC)
  private toVertexSymbol(symbol: string): string {
    // Handle both "ETH" and "ETH-USD" formats
    const base = symbol.replace("-USD", "");
    return `${base}-PERP_USDC`;
  }

  // Convert Vertex symbol back to standard format
  private toStandardSymbol(vertexSymbol: string): string {
    const base = vertexSymbol.replace("-PERP_USDC", "");
    return `${base}-USD`;
  }

  async getFundingAndOI(): Promise<{ [key: string]: FundingData }> {
    return this.withRetry(async () => {
      const data = await this.api.getFundingAndOpenInterest();

      const result: { [key: string]: FundingData } = {};

      for (const [tickerId, contractData] of Object.entries(data)) {
        const standardSymbol = this.toStandardSymbol(tickerId);
        const contract = contractData as any;

        if (parseFloat(contract.open_interest) === 0) {
          continue;
        }

        result[standardSymbol] = {
          fundingRate: contract.funding_rate.toString(),
          openInterest: contract.open_interest.toString(),
        };
      }

      return result;
    });
  }

  async getOrderBook(symbol: string): Promise<OrderBook> {
    return this.withRetry(async () => {
      const vertexSymbol = this.toVertexSymbol(symbol);
      const data = await this.api.getOrderBook(vertexSymbol);

      return {
        bids: data.bids.map(
          (level: [number, number]): OrderBookLevel => ({
            price: level[0].toString(),
            size: level[1].toString(),
          }),
        ),
        asks: data.asks.map(
          (level: [number, number]): OrderBookLevel => ({
            price: level[0].toString(),
            size: level[1].toString(),
          }),
        ),
        timestamp: data.timestamp || Date.now(),
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
          const standardSymbol = ticker.includes("-USD")
            ? ticker
            : `${ticker}-USD`;
          const orderbook = await this.getOrderBook(standardSymbol);
          return { ticker: standardSymbol, orderbook };
        } catch (error) {
          const standardSymbol = ticker.includes("-USD")
            ? ticker
            : `${ticker}-USD`;
          console.error(
            `Error fetching orderbook for ${standardSymbol}:`,
            error,
          );
          return { ticker: standardSymbol, orderbook: null };
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
