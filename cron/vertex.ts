interface VertexMarketData {
  [ticker: string]: {
    ticker_id: string;
    base_currency: string;
    quote_currency: string;
    last_price: number;
    base_volume: number;
    quote_volume: number;
    product_type: string;
    contract_price: number;
    contract_price_currency: string;
    open_interest: number;
    open_interest_usd: number;
    index_price: number;
    mark_price: number;
    funding_rate: number;
    next_funding_rate_timestamp: number;
    price_change_percent_24h: number;
  };
}

export async function getVertex(tickers: string[]): Promise<{ [key: string]: { fundingRate: string; openInterest: string; } }> {
  const url = 'https://archive.prod.vertexprotocol.com/v2/contracts';
  const response = await fetch(url, {
    headers: {
      'accept': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`HTTP error ${response.status}`);
  }

  const data: VertexMarketData = await response.json();
  const result: { [key: string]: { fundingRate: string; openInterest: string; } } = {};

  for (const ticker of tickers) {
    const tickerKey = `${ticker}-PERP_USDC`;
    if (data[tickerKey]) {
      result[`${ticker}-USD`] = {
        fundingRate: (parseFloat(data[tickerKey].funding_rate.toString()) * 0.04).toFixed(18).toString(),
        openInterest: data[tickerKey].open_interest.toString(),
      };
    }
  }

  return result;
}
