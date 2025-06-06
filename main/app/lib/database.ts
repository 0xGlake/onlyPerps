import dotenv from 'dotenv';
dotenv.config();

import { Pool } from 'pg';

const connectionString = process.env.CONNECTION_STRING;

const pool = new Pool({
  connectionString,
});

export default pool
