import FundingRateHeatMap from '../app/components/FundingRateHeatMap';
import OpenInterestChart from '../app/components/OpenInterestStackedChart';
import '../app/styles/globals.css';
import AprToggleSwitch from './components/AprToggleSwitch';
import TimeDropDown from './components/TimeDropDown';
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
    <div className="bg-gray-900 min-h-screen text-white p-8">
      <h1 className="text-4xl font-bold mb-0 text-center">Funding Rate Heat Map</h1>
      <div className='flex justify-center m-5 space-x-5'>
        <AprToggleSwitch />
        <TimeDropDown />
      </div>
        <FundingRateHeatMap data={data} />
      <h1 className="text-4xl font-bold mt-8 mb-4 text-center">Open Interest Stacked Chart</h1>
        <OpenInterestChart data={data} />
  </div>
  );
}