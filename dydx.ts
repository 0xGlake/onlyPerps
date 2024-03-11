interface DyDxMarket {
  market: string;
  status: string;
  priceChange24H: string;
  volume24H: string;
  nextFundingRate: string;
  initialMarginFraction: string;
  maintenanceMarginFraction: string;
  openInterest: string;
}

export async function getDyDx(tickers: string[]): Promise<{ [key: string]: { fundingRate: string, openInterest: string } }> {
  const response = await fetch(`https://indexer.dydx.trade/v4/perpetualMarkets`);

  if (!response.ok) {
    throw new Error(`HTTP error ${response.status}`);
  }

  const data: { markets: { [key: string]: DyDxMarket } } = await response.json();

  return tickers.reduce<{ [key: string]: { fundingRate: string, openInterest: string } }>((acc, ticker) => {
    const market = data.markets[`${ticker}-USD`];
    
    if (market) {
      acc[`${ticker}-USD`] = {
        fundingRate: market.nextFundingRate,
        openInterest: market.openInterest,
      };
    }

    return acc;
  }, {});
}

getDyDx(['BTC', 'ETH', 'SOL']).then(data => {
    console.log(data);
  })
  .catch(error => {
    console.error('Error fetching market data:', error);
  });