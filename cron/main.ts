import { getAevo } from "./aevo";
import { getRabbitX } from "./rabbit";
import { getDyDx } from "./dydx";
import { getHyper } from "./hyper";

import dotenv from 'dotenv';
dotenv.config();

import pg from 'pg';
const { Client } = pg;

const connectionString = process.env.CONNECTION_STRING;

const client = new Client({
  connectionString,
});

client.connect((err) => {
  if (err) {
    console.log('Error creating connection', err.stack);
  } else {
    console.log('Connected to database');
  }
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
    await client.query(query, values);
    console.log('Data stored in the onlyperps table');
  } catch (err) {
    console.error('Error storing data:', err);
  }
}


aggregate().then(storeData).then(() =>{
  client.end((err) => {
    if (err) {
      console.log('Error closing connection', err.stack);
    } else {
      console.log('Connection to PostgreSQL closed.');
    }
  });
})

