import { getAevo } from "./aevo";
import { getRabbitX } from "./rabbit";
import { getDyDx } from "./dydx";
import { getHyper } from "./hyper";


// Example usage
getAevo(['BTC', 'ETH', 'SOL']).then(data => {
    console.log(data);
  }).catch(error => {
    console.error('Error fetching filtered data:', error);
  })

getRabbitX(['BTC', 'ETH', 'SOL']).then(data => {
  console.log(data);
}).catch(error => {
  console.error('Error fetching filtered data:', error);
})


getDyDx(['BTC', 'ETH', 'SOL']).then(data => {
  console.log(data);
}).catch(error => {
  console.error('Error fetching filtered data:', error);
})


getHyper(['BTC', 'ETH', 'SOL']).then(data => {
  console.log(data);
}).catch(error => {
  console.error('Error fetching filtered data:', error);
})

