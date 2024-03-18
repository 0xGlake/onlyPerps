interface RabbitMarket {
  id: string;
  status: string;
  instant_funding_rate: string;
  average_daily_volume: string;
  market_title: string;
  icon_url: string;
  open_interest: string;
  fair_price: string;
  index_price: string;
}

export async function getRabbitX(tickers: string[]): Promise<{ [key: string]: { fundingRate: string, openInterest: string } }> {
  const response = await fetch(`https://api.prod.rabbitx.io/markets`, {
    headers: {
      'Content-Type': 'application/json'
    }
  });

  if (!response.ok) {
    throw new Error(`HTTP error ${response.status}`);
  }

  const jsonResponse = await response.json();

  if (!jsonResponse.success) {
    throw new Error('API response was not successful');
  }

  const marketsData = jsonResponse.result;

  // Accumulate filtered markets data using reduce, similar to your reference implementation
  const filteredMarkets = tickers.reduce<{ [key: string]: { fundingRate: string, openInterest: string } }>((acc, ticker) => {
    const marketKey = `${ticker}-USD`;
    const market = marketsData.find((m: RabbitMarket) => m.id === marketKey);
    
    if (market) {
      acc[marketKey] = {
        fundingRate: market.instant_funding_rate,
        openInterest: (market.open_interest / market.index_price).toString()
      };
    }

    return acc;
  }, {});

  return filteredMarkets;

}
