import dotenv from 'dotenv';

dotenv.config();

const COIN_GECKO = process.env.COIN_GECKO;

if (!COIN_GECKO) {
  console.error('API key is not defined. Please set COIN_GECKO in your environment variables.');
  process.exit(1);
}

interface ExchangeData {
  name: string;
  id: string;
  open_interest_btc: number;
  trade_volume_24h_btc: string;
  number_of_perpetual_pairs: number;
  number_of_futures_pairs: number;
  image: string;
  year_established: number | null;
  country: string | null;
  description: string;
  url: string;
}

const url = `https://api.coingecko.com/api/v3/derivatives/`;

const options = {
  method: 'GET',
  headers: { accept: 'application/json', 'x-cg-demo-api-key': COIN_GECKO },
};

// Fetch the exchange data
fetch(url, options)
  .then(response => response.json())
  .then(data => {
    const exchangeMap: Map<string, ExchangeData> = new Map();

    // Store the exchanges in the map
    data.forEach((exchange: ExchangeData) => {
      exchangeMap.set(exchange.id, exchange);
    });

    // Use the exchangeMap as needed
    console.log(exchangeMap);
  })
  .catch(error => {
    console.error('Error fetching exchange data:', error);
  });