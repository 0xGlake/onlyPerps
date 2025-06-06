// app/lib/exchanges/paradex/adapter.ts
import {
  BaseExchange,
  ExchangeData,
  FundingData,
  OrderBook,
  OrderBookLevel,
} from "../base/exchange";
import { ParadexAPI } from "./api";

interface HyperMarket {
  name: string;
  funding: string;
  openInterest: string;
  premium: string;
}

export class ParadexExchange extends BaseExchange {
  name = "paradex";
  private api = new ParadexAPI();

  async getFundingAndOI(): Promise<{ [key: string]: FundingData }> {
    return this.withRetry(async () => {
      const data = await this.api.getMarketsSummary();

      const result: { [key: string]: FundingData } = {};

      // Filter for perpetual markets only (ending with -PERP)
      const perpMarkets = data.results.filter(
        (market: any) => market.symbol && market.symbol.endsWith("-PERP"),
      );

      for (const market of perpMarkets) {
        // Convert symbol format: "BTC-USD-PERP" -> "BTC-USD"
        const standardSymbol = market.symbol.replace("-PERP", "");

        // Only add if we have funding rate and open interest
        if (
          market.funding_rate !== undefined &&
          market.open_interest !== undefined &&
          parseFloat(market.open_interest) !== 0
        ) {
          result[standardSymbol] = {
            fundingRate: market.funding_rate,
            openInterest: market.open_interest,
          };
        }
      }

      return result;
    });
  }

  async getOrderBook(symbol: string): Promise<OrderBook> {
    return this.withRetry(async () => {
      // Convert symbol format: "BTC-USD" -> "BTC-USD-PERP"
      const paradexSymbol = `${symbol}-PERP`;
      const data = await this.api.getOrderBook(paradexSymbol);

      // Transform bid/ask arrays to standard format
      const transformLevel = (level: any[]): OrderBookLevel => ({
        price: level[0],
        size: level[1],
      });

      return {
        bids: data.bids.map(transformLevel),
        asks: data.asks.map(transformLevel),
        timestamp: data.last_updated_at || Date.now(),
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
          // Handle both "ETH" and "ETH-USD" formats
          const fullTicker = ticker.includes("-") ? ticker : `${ticker}-USD`;
          const orderbook = await this.getOrderBook(fullTicker);
          return { ticker: fullTicker, orderbook };
        } catch (error) {
          console.error(`Error fetching orderbook for ${ticker}:`, error);
          // Handle both "ETH" and "ETH-USD" formats for consistency
          const fullTicker = ticker.includes("-") ? ticker : `${ticker}-USD`;
          return { ticker: fullTicker, orderbook: null };
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
      console.error("Error fetching Paradex data:", error);
      return {};
    }
  }
}
