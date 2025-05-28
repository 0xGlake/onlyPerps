// app/lib/exchanges/paradex/adapter.ts
import {
  BaseExchange,
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

export class ParadexExchange extends BaseExchange {}
