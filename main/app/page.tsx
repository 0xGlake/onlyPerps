import FundingRateHeatMap from '../app/components/FundingRateHeatMap';
import OpenInterestChart from '../app/components/OpenInterestStackedChart';
//import { preprocessData } from './utils/preprocessdata';

type ExchangeData = {
  [key: string]: {
    [key: string]: {
      fundingRate: string;
      openInterest: string;
    };
  };
};

async function getData(): Promise<ExchangeData[]> {
  const response = await fetch('http://localhost:3000/api/top10');
  return await response.json();
}

export default async function Home() {
  const data = await getData();
  //const preprocessedData = preprocessData(data);

  return (
    <div>
      <h1>Funding Rate Heat Map</h1>
      <FundingRateHeatMap data={data} />

      <h1>Open Interest Stacked Chart</h1>
      <OpenInterestChart data={data} />
    </div>
  );
}