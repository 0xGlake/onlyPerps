import { getAevo } from "./aevo";
import { getRabbitX } from "./rabbit";
import { getDyDx } from "./dydx";
import { getHyper } from "./hyper";
import { getVertex } from "./vertex";
import { getDrift } from "./drift";
import { fetchCoinData, CoinData } from "./tokensData";

import dotenv from 'dotenv';
dotenv.config();

import pg, { QueryResult } from 'pg';
const { Client } = pg;

const connectionString = process.env.CONNECTION_STRING;

const client = new Client({
  connectionString,
});

interface ExchangeData {
  dataAevo: Record<string, any> | null;
  dataRabbitx: Record<string, any> | null;
  dataDyDx: Record<string, any> | null;
  dataHyper: Record<string, any> | null;
  dataVertex: Record<string, any> | null;
  dataDrift: Record<string, any> | null;
}

export async function aggregate() {
  const promises = [
    getAevo(['ETH', 'BTC', 'SOL']).catch(err => {
      console.error('Error fetching data from Aevo:', err);
      return null;
    }),
    getRabbitX(['ETH', 'BTC', 'SOL']).catch(err => {
      console.error('Error fetching data from RabbitX:', err);
      return null;
    }),
    getDyDx(['ETH', 'BTC', 'SOL']).catch(err => {
      console.error('Error fetching data from DyDx:', err);
      return null;
    }),
    getHyper(['ETH', 'BTC', 'SOL']).catch(err => {
      console.error('Error fetching data from Hyper:', err);
      return null;
    }),
    getVertex(['ETH', 'BTC', 'SOL']).catch(err => {
      console.error('Error fetching data from Vertex:', err);
      return null;
    }),
    getDrift(['ETH', 'BTC', 'SOL']).catch(err => {
      console.error('Error fetching data from Drift:', err);
      return null;
    })
  ];

  const [dataAevo, dataRabbitx, dataDyDx, dataHyper, dataVertex, dataDrift] = await Promise.all(promises);
  return { dataAevo, dataRabbitx, dataDyDx, dataHyper, dataVertex, dataDrift };
}


async function storeData(data: ExchangeData) {
  const { dataAevo, dataRabbitx, dataDyDx, dataHyper, dataVertex, dataDrift } = data;

  const query = `
    INSERT INTO onlyperps (aevo_data, rabbitx_data, dydx_data, hyper_data, vertex_data, drift_data)
    VALUES ($1, $2, $3, $4, $5, $6)
  `;

  const values = [
    dataAevo ? JSON.stringify(dataAevo) : null,
    dataRabbitx ? JSON.stringify(dataRabbitx) : null,
    dataDyDx ? JSON.stringify(dataDyDx) : null,
    dataHyper ? JSON.stringify(dataHyper) : null,
    dataVertex ? JSON.stringify(dataVertex) : null,
    dataDrift ? JSON.stringify(dataDrift) : null
  ];

  try {
    // Specifying the generic types here can help TypeScript infer the right overload
    await client.query<QueryResult<any>>(query, values); // LOOK AT THIS LINE IF FUCKED ERROR
  } catch (err) {
      console.error('Error storing data:', err);
  }
}

async function storeTokenData(data: Record<string, CoinData>) {
  const query = `
    INSERT INTO onlyperpstokens (data)
    VALUES ($1)
  `;

  const tokenData: Record<string, Partial<CoinData>> = {};

  for (const [tokenId, coinData] of Object.entries(data)) {
    tokenData[tokenId] = {
      current_price: coinData.current_price,
      fully_diluted_valuation: coinData.fully_diluted_valuation,
      market_cap: coinData.market_cap,
    };
  }

  const values = [JSON.stringify(tokenData)];

  try {
    await client.query<QueryResult<any>>(query, values);
  } catch (err) {
    console.error('Error storing token data:', err);
  }
}

export async function handler(event: any, context: any): Promise<void> {
  try {
    await client.connect();
    console.log('Connected to database');

    const [data, tokenData] = await Promise.all([
      aggregate(),
      fetchCoinData(['aevo-exchange', 'rabbitx', 'dydx-chain', 'vertex-protocol', 'drift-protocol', 'jupiter-exchange-solana', 'gmx']).catch(err => {
        console.error('Error fetching token data:', err);
        return {};
      }),
    ]);

    await Promise.all([
      storeData(data),
      storeTokenData(tokenData),
    ]);

    console.log('Data stored in the onlyperps table');
    console.log('Token data stored in the onlyperpstokens table');

  } catch (err) {
    console.error('Error:', err);
  } finally {
    try {
      await client.end();
      console.log('Connection to PostgreSQL closed.');
    } catch (err) {
      console.error('Error closing connection:', err);
    }
  }
}
