'use client';

import FundingRateHeatMap from '../app/components/FundingRateHeatMap';
import OpenInterestChart from '../app/components/OpenInterestStackedChart';
import '../app/styles/globals.css';
import AprToggleSwitch from './components/AprToggleSwitch';
import TimeDropDown from './components/TimeDropDown';
import { useState, useEffect } from 'react';

type ExchangeData = {
  [key: string]: {
    [key: string]: {
      fundingRate: string;
      openInterest: string;
    };
  };
};

async function getData(selectedOption: string): Promise<ExchangeData[]> {
  const response = await fetch(`http://localhost:3000/api/top10?timeframe=${selectedOption}`);
  return await response.json();
}

export default function Home() {
  const [selectedOption, setSelectedOption] = useState('1 Day');
  const [data, setData] = useState<ExchangeData[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const fetchedData = await getData(selectedOption);
        setData(fetchedData);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
      setIsLoading(false);
    };

    fetchData();
  }, [selectedOption]);

  return (
    <div className="bg-gray-900 min-h-screen text-white p-8">
      <h1 className="text-4xl font-bold mb-0 text-center">Funding Rate Heat Map</h1>
      <div className='flex justify-center m-5 space-x-5'>
        <AprToggleSwitch />
        <TimeDropDown selectedOption={selectedOption} setSelectedOption={setSelectedOption} />
      </div>
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <svg className="animate-spin h-20 w-20 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>
      ) : (
        <>
          <FundingRateHeatMap data={data} />
          <h1 className="text-4xl font-bold mt-8 mb-4 text-center">Open Interest Stacked Chart</h1>
          <OpenInterestChart data={data} />
        </>
      )}
    </div>
  );
}
