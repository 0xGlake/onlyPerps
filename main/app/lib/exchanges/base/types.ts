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
