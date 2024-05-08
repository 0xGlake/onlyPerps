import { NextApiRequest, NextApiResponse } from 'next';
import pool from '../../lib/database';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const { rows } = await pool.query(
    `SELECT id, timestamp, aevo_data, rabbitx_data, dydx_data, hyper_data, drift_data, vertex_data
    FROM onlyperps
    WHERE aevo_data IS NOT NULL
    AND rabbitx_data IS NOT NULL
    AND dydx_data IS NOT NULL
    AND hyper_data IS NOT NULL
    AND drift_data IS NOT NULL
    AND vertex_data IS NOT NULL
    AND aevo_data != '{}'
    AND rabbitx_data != '{}'
    AND dydx_data != '{}'
    AND hyper_data != '{}'
    AND drift_data != '{}'
    AND vertex_data != '{}'
    ORDER BY id DESC
    LIMIT 672;`);
    return NextResponse.json(rows);
  } catch (error) {
    console.error('Error fetching data from Neon:', error);
    return NextResponse.json({ error: 'An error occurred while fetching data from Neon' }, { status: 500 });
  }
}
