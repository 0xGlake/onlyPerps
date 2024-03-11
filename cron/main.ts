
import { getAevo } from "./aevo";
import { getRabbitX } from "./rabbit";
import { getDyDx } from "./dydx";
import { getHyper } from "./hyper";


export async function aggregate() {
  const promises = [
    getAevo(['ETH', 'BTC', 'SOL']),
    getRabbitX(['ETH', 'BTC', 'SOL']),
    getDyDx(['ETH', 'BTC', 'SOL']),
    getHyper(['ETH', 'BTC', 'SOL'])
  ];

  const [dataAevo, dataRabbitx, dataDyDx, dataHyper] = await Promise.all(promises);

  return { dataAevo, dataRabbitx, dataDyDx, dataHyper };
}

aggregate().then(result => {
  console.log(result);
});