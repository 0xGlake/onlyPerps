import FundingRateHeatMap from '../app/components/FundingRateHeatMap';

type FundingRateData = {
  [key: string]: {
    [key: string]: {
      fundingRate: string;
      openInterest: string;
    };
  };
};

async function getData(): Promise<FundingRateData[]> {
  const response = await fetch('http://localhost:3000/api/top10');
  return await response.json();
}

export default async function Home() {
  const data = await getData();

  return (
    <div>
      <h1>Funding Rate Heat Map</h1>
      <FundingRateHeatMap data={data} />
    </div>
  );
}