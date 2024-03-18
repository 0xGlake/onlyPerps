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

export async function getAevo(tickers: string[], maxRetries = 3, retryDelay = 1000): Promise<{ [key: string]: { fundingRate: string; openInterest: string; } }> {
  const result: { [key: string]: { fundingRate: string; openInterest: string; } } = {};

  for (const ticker of tickers) {
    let retries = 0;
    let data: AevoMarketData | null = null;

    while (retries < maxRetries) {
      const url = `https://api.aevo.xyz/instrument/${ticker}-PERP`;
      const response = await fetch(url, {
        headers: {
          'accept': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error ${response.status}`);
      }

      data = await response.json();

      if (data !== null && data.funding_rate !== null && data.markets.total_oi !== null) {
        break;
      }

      retries++;
      await new Promise(resolve => setTimeout(resolve, retryDelay));
    }

    if (data !== null) {
      result[`${ticker}-USD`] = {
        fundingRate: data.funding_rate,
        openInterest: data.markets.total_oi,
        //dailyVolume: data.markets.daily_volume
      };
    } else {
      console.warn(`Failed to retrieve data for ${ticker} after ${maxRetries} retries.`);
    }
  }

  return result;
}
