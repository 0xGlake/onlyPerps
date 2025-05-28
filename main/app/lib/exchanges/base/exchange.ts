// app/lib/exchanges/base/exchanges.ts
export interface FundingData {
  fundingRate: string;
  openInterest: string;
}

export interface OrderBookLevel {
  price: string;
  size: string;
  count?: number;
}

export interface OrderBook {
  bids: OrderBookLevel[];
  asks: OrderBookLevel[];
  timestamp: number;
}

export interface ExchangeData {
  [symbol: string]: {
    fundingRate: string;
    openInterest: string;
    orderBook?: OrderBook;
  };
}

export abstract class BaseExchange {
  abstract name: string;

  abstract getFundingAndOI(): Promise<{ [key: string]: FundingData }>;
  abstract getOrderBook(symbol: string): Promise<OrderBook>;

  // Retry logic wrapper
  protected async withRetry<T>(
    operation: () => Promise<T>,
    maxRetries: number = 3,
    delay: number = 1000,
  ): Promise<T> {
    for (let i = 0; i < maxRetries; i++) {
      try {
        return await operation();
      } catch (error) {
        if (i === maxRetries - 1) throw error;
        console.warn(
          `${this.name} attempt ${i + 1} failed, retrying in ${delay}ms:`,
          error,
        );
        await new Promise((resolve) =>
          setTimeout(resolve, delay * Math.pow(2, i)),
        );
      }
    }
    throw new Error("Max retries exceeded");
  }
}
