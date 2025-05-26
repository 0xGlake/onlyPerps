export const REDIS_KEYS = {
  // Exchange data: exchange:datatype:symbol
  FUNDING: (exchange: string, symbol: string) =>
    `${exchange}:funding:${symbol}`,
  ORDERBOOK: (exchange: string, symbol: string) =>
    `${exchange}:orderbook:${symbol}`,

  // Metadata
  LAST_UPDATE: (exchange: string) => `${exchange}:last_update`,
  EXCHANGE_STATUS: (exchange: string) => `${exchange}:status`,

  // Aggregated data
  ALL_FUNDING: "funding:all",
  ALL_ORDERBOOKS: "orderbooks:all",
};
