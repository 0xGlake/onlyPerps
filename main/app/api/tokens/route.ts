import pool from '../../lib/database';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const { rows } = await pool.query(
    `SELECT *
    FROM onlyperpstokens
    ORDER BY id DESC
    LIMIT 672;`);
    return NextResponse.json(rows);
  } catch (error) {
    console.error('Error fetching data from Neon:', error);
    return NextResponse.json({ error: 'An error occurred while fetching data from Neon' }, { status: 500 });
  }
}
