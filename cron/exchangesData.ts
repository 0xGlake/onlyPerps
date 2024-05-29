import dotenv from 'dotenv';

dotenv.config();

interface ExchangeData {
  name: string;
  id: string;
  open_interest_btc: number;
  trade_volume_24h_btc: number;
  number_of_perpetual_pairs: number;
  number_of_futures_pairs: number;
  image: string;
  year_established: number | null;
  country: string | null;
  description: string;
  url: string;
  open_interest_usd: number;
  trade_volume_24h_usd: number;
}

export async function fetchExchangeData(exchangeIds: string[]): Promise<Map<string, ExchangeData>> {
  const COIN_GECKO = process.env.COIN_GECKO;

  if (!COIN_GECKO) {
    console.error('API key is not defined. Please set COIN_GECKO in your environment variables.');
    process.exit(1);
  }

  const exchangesUrl = `https://api.coingecko.com/api/v3/derivatives/exchanges`;
  const bitcoinPriceUrl = 'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd&include_market_cap=false&include_24hr_vol=false&include_24hr_change=false&include_last_updated_at=false';

  const options = {
    method: 'GET',
    headers: { accept: 'application/json', 'x-cg-demo-api-key': COIN_GECKO },
  };

  try {
    // Fetch the Bitcoin price
    const bitcoinPriceResponse = await fetch(bitcoinPriceUrl, options);
    const bitcoinPriceData = await bitcoinPriceResponse.json();
    const bitcoinPrice = bitcoinPriceData.bitcoin.usd;

    // Fetch the exchange data
    const exchangeResponse = await fetch(exchangesUrl, options);
    const exchangeData = await exchangeResponse.json();
    
    const exchangeMap: Map<string, ExchangeData> = new Map();

    // Filter and store the exchanges in the map
    exchangeData
      .filter((exchange: ExchangeData) => exchangeIds.includes(exchange.id))
      .forEach((exchange: ExchangeData) => {

        // Convert open interest and trade volume to USD basis
        const openInterestUSD = exchange.open_interest_btc * bitcoinPrice;
        const tradeVolumeUSD = exchange.trade_volume_24h_btc * bitcoinPrice;

        // Update the exchange object with USD values
        const updatedExchange: ExchangeData = {
          ...exchange,
          open_interest_usd: openInterestUSD,
          trade_volume_24h_usd: tradeVolumeUSD,
        };
        exchangeMap.set(exchange.id, updatedExchange);
      });
    console.log(exchangeMap);
    return exchangeMap;
  } catch (error) {
    console.error('Error fetching data:', error);
    throw error;
  }
}

// Example example usage
// fetchExchangeData(['aevo', 'vertex_protocol_derivatives', 'drift_protocol', 'hyperliquid', 'rabbitx', 'dydx_perpetual']);