import { NextResponse } from 'next/server';

import { getAevo } from "./aevo";
import { getRabbitX } from "./rabbit";
import { getDyDx } from "./dydx";
import { getHyper } from "./hyper";

export async function GET() {
  const dataAevo = await getAevo(['ETH', 'BTC', 'SOL']);
  const dataRabbitx = await getRabbitX(['ETH', 'BTC', 'SOL']);
  const dataDyDx = await getDyDx(['ETH', 'BTC', 'SOL']);
  const dataHyper = await getHyper(['ETH', 'BTC', 'SOL']);
  return NextResponse.json({ dataAevo, dataRabbitx, dataDyDx, dataHyper });
}
