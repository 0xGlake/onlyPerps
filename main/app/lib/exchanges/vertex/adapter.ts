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
            count: 1,
          }),
        ),
        asks: data.asks.map(
          (level: [number, number]): OrderBookLevel => ({
            price: level[0].toString(),
            size: level[1].toString(),
            count: 1,
          }),
        ),
        timestamp: data.timestamp || Date.now(),
      };
    });
  }

  async getAllData(orderbookTickers: string[]): Promise<ExchangeData> {
    return this.withRetry(async () => {
      // Get funding and OI data for all available contracts
      const fundingData = await this.getFundingAndOI();

      const result: ExchangeData = {};

      // Process each requested ticker
      for (const ticker of orderbookTickers) {
        const standardSymbol = ticker.includes("-USD")
          ? ticker
          : `${ticker}-USD`;

        try {
          // Get orderbook for this specific ticker
          const orderbook = await this.getOrderBook(standardSymbol);

          // Combine funding/OI data with orderbook
          result[standardSymbol] = {
            fundingData: {
              fundingRate: fundingData[standardSymbol]?.fundingRate || "0",
              openInterest: fundingData[standardSymbol]?.openInterest || "0",
            },
            orderBook: orderbook,
          };
        } catch (error) {
          console.warn(`Failed to get data for ${standardSymbol}:`, error);
          // Still include the ticker with funding data if available
          if (fundingData[standardSymbol]) {
            result[standardSymbol] = {
              fundingData: {
                fundingRate: fundingData[standardSymbol].fundingRate,
                openInterest: fundingData[standardSymbol].openInterest,
              },
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
