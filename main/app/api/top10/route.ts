import { NextApiRequest, NextApiResponse } from 'next';
import pool from '../../lib/database';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const { rows } = await pool.query(
    `SELECT *
    FROM onlyperps
    WHERE aevo_data IS NOT NULL
      AND rabbitx_data IS NOT NULL
      AND dydx_data IS NOT NULL
      AND hyper_data IS NOT NULL
      AND aevo_data != '{}'
      AND rabbitx_data != '{}'
      AND dydx_data != '{}'
      AND hyper_data != '{}'
    ORDER BY id DESC
    LIMIT 96;`);
    return NextResponse.json(rows);
  } catch (error) {
    console.error('Error fetching data from Neon:', error);
    return NextResponse.json({ error: 'An error occurred while fetching data from Neon' }, { status: 500 });
  }
}
