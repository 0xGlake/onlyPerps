import { getAevo } from "./aevo";
import { getRabbitX } from "./rabbit";
import { getDyDx } from "./dydx";
import { getHyper } from "./hyper";

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
    })
  ];

  const [dataAevo, dataRabbitx, dataDyDx, dataHyper] = await Promise.all(promises);
  return { dataAevo, dataRabbitx, dataDyDx, dataHyper };
}


async function storeData(data: ExchangeData) {
  const { dataAevo, dataRabbitx, dataDyDx, dataHyper } = data;

  const query = `
    INSERT INTO onlyperps (aevo_data, rabbitx_data, dydx_data, hyper_data)
    VALUES ($1, $2, $3, $4)
  `;

  const values = [
    dataAevo ? JSON.stringify(dataAevo) : null,
    dataRabbitx ? JSON.stringify(dataRabbitx) : null,
    dataDyDx ? JSON.stringify(dataDyDx) : null,
    dataHyper ? JSON.stringify(dataHyper) : null,
  ];

  try {
    // Specifying the generic types here can help TypeScript infer the right overload
    await client.query<QueryResult<any>>(query, values); // LOOK AT THIS LINE IF FUCKED ERROR
  } catch (err) {
      console.error('Error storing data:', err);
  }
}


export async function handler(event: any, context: any): Promise<void> {
  try {
    await client.connect();
    console.log('Connected to database');

    const data = await aggregate();
    await storeData(data);

    console.log('Data stored in the onlyperps table');
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
