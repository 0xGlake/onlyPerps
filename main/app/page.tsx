'use client';

import FundingRateHeatMap from '../app/components/FundingRateHeatMap';
import OpenInterestChart from '../app/components/OpenInterestStackedChart';
import '../app/styles/globals.css';
import AprToggleSwitch from './components/AprToggleSwitch';
import AssetBaseToggleSwitch from './components/AssetBaseToggleSwitch';
import TimeDropDown from './components/TimeDropDown';
import { useState, useEffect, useMemo } from 'react';

type ExchangeData = {
  [key: string]: {
    [key: string]: {
      fundingRate: string;
      openInterest: string;
    };
  };
};

type AssetPriceData = {
  symbol: string;
  price: string;
}

async function getData(): Promise<ExchangeData[]> {
  const response = await fetch(`http://localhost:3000/api/fundingAndOI`);
  return await response.json();
}

async function getAssetPrice(): Promise<AssetPriceData[]> {
  // todo: make the fetch more general and not hardcoded
  const response = await fetch(`https://api.binance.com/api/v3/ticker/price?symbols=[%22BTCUSDT%22,%22ETHUSDT%22,%22SOLUSDT%22]`);
  return await response.json();
}

function filterData(data: ExchangeData[], selectedOption: string): ExchangeData[] {
  const timeframes: { [key: string]: number } = {
    '1-Day': 96,
    '3-Days': 96*3,
    '7-Days': 96*7
  };

  const timeframe = timeframes[selectedOption];
  return data.slice(0, timeframe);
}

export default function Home() {
  const [selectedOption, setSelectedOption] = useState('7-Days');
  const [isAPR, setIsAPR] = useState(true)
  const [isBase, setIsBase] = useState(true)
  const [data, setData] = useState<ExchangeData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [filteredData, setFilteredData] = useState<ExchangeData[]>([]);
  const [currentAssetPrice, setCurrentAssetPrice] = useState<AssetPriceData[]>([]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const fetchedData = await getData();
      const assetPriceData = await getAssetPrice();
      setData(fetchedData);
      setCurrentAssetPrice(assetPriceData);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
    setIsLoading(false);
  };

  useEffect(() => {  
    fetchData();
  }, []);

  useEffect(() => {
    setFilteredData(filterData(data, selectedOption));
  }, [selectedOption, data]);

  const memoizedFilteredData = useMemo(
    () => filterData(data, selectedOption), // the usememo action to perform
    [data, selectedOption]); // the dependencies that will trigger the usememo action
    
  return (
    <div className="bg-gray-900 min-h-screen text-white p-8">
      <h1 className="text-4xl font-bold mb-0 text-center">Funding Rate Heat Map</h1>
      <div className='flex justify-center m-5 space-x-5'>
        <AprToggleSwitch isAPR={isAPR} setIsAPR={setIsAPR} />
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
          <FundingRateHeatMap data={memoizedFilteredData} isAPR={isAPR}/>
          <h1 className="text-4xl font-bold mt-8 mb-4 text-center">Open Interest Stacked Chart</h1>
          <div className='flex justify-center m-5 space-x-5'>
            <AssetBaseToggleSwitch isBase={isBase} setIsBase={setIsBase}/>
          </div>
          <OpenInterestChart data={memoizedFilteredData} isBase={isBase} currentAssetPrice={currentAssetPrice}/>
        </>
      )}
    </div>
  );
}
