interface AevoMarketData {
  asset: string;
  instrumentId: string;
  instrumentName: string;
  instrumentType: string;
  markPrice: string;
  indexPrice: string;
  markets: {
    daily_volume: string;
    daily_volume_contracts: string;
    total_volume: string;
    total_volume_contracts: string;
    total_oi: string;
  };
  bestBid: { price: string; amount: string };
  bestAsk: { price: string; amount: string };
  funding_rate: string;
}

export async function getAevo(tickers: string[]): Promise<{ [key: string]: { fundingRate: string; openInterest: string;} }> {
  const result: { [key: string]: { fundingRate: string; openInterest: string;} } = {};

  for (const ticker of tickers) {
    const url = `https://api.aevo.xyz/instrument/${ticker}-PERP`;
    const response = await fetch(url, {
      headers: {
        'accept': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error ${response.status}`);
    }

    const data: AevoMarketData = await response.json();
    result[`${ticker}-USD`] = {
      fundingRate: data.funding_rate,
      openInterest: data.markets.total_oi,
      //dailyVolume: data.markets.daily_volume
    };
  }

  return result;
}

getAevo(['ETH', 'BTC', 'SOL']).then(data => {
    console.log(data);
  }).catch(error => {
    console.error('Error fetching market data:', error);
  });



