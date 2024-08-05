import dotenv from 'dotenv';
dotenv.config();

const COIN_GECKO = process.env.COIN_GECKO;

if (!COIN_GECKO) {
  console.error('API key is not defined. Please set COIN_GECKO in your environment variables.');
}

export interface CoinData {
  id: string;
  symbol: string;
  name: string;
  image: string;
  current_price: number;
  market_cap: number;
  market_cap_rank: number;
  fully_diluted_valuation: number;
  total_volume: number;
  high_24h: number;
  low_24h: number;
  price_change_24h: number;
  price_change_percentage_24h: number;
  market_cap_change_24h: number;
  market_cap_change_percentage_24h: number;
  circulating_supply: number;
  total_supply: number;
  max_supply: number;
  ath: number;
  ath_change_percentage: number;
  ath_date: string;
  atl: number;
  atl_change_percentage: number;
  atl_date: string;
  roi: null;
  last_updated: string;
}

function createCoinDataMap(data: CoinData[]): Record<string, CoinData> {
  return data.reduce((map, coin) => {
    map[coin.id] = coin;
    return map;
  }, {} as Record<string, CoinData>);
}

export async function fetchCoinData(coinIds: string[]): Promise<Record<string, CoinData>> {
  if (!COIN_GECKO) {
    return Promise.reject('API key is not defined. Please set COIN_GECKO in your environment variables.');
  }

  const idsParam = coinIds.join('%2C');
  const url = `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=${idsParam}`;

  const options = {
    method: 'GET',
    headers: { accept: 'application/json', 'x-cg-demo-api-key': COIN_GECKO },
  };

  return fetch(url, options)
    .then(res => res.json())
    .then(json => createCoinDataMap(json))
    .catch(err => {
      console.error('error:' + err);
      throw err;
    });
}

// Example usage
// const coins = ['aevo-exchange', 'rabbitx', 'dydx-chain', 'vertex-protocol', 'drift-protocol', 'jupiter-exchange-solana', 'gmx'];

// fetchCoinData(coins).then(data => {
//   console.log(data);
// });

// npx ts-node tokensData.ts
