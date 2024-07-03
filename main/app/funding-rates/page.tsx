'use client';

import '../styles/globals.css';

import { useState, useEffect } from 'react';
import { useDataStore, fetchDataForPage } from '../stores/useDataStore';
import FundingRateHeatMap from '../components/FundingRateHeatMap';
import OpenInterestChart from '../components/OpenInterestStackedChart';
import AprToggleSwitch from '../components/AprToggleSwitch';
import AssetBaseToggleSwitch from '../components/AssetBaseToggleSwitch';
import TimeDropDown from '../components/TimeDropDown';

export default function FundingRatesPage() {
  const { 
    getFilteredExchangeData,
    assetPriceData
  } = useDataStore();

  const [selectedOption, setSelectedOption] = useState('7-Days');
  const [isAPR, setIsAPR] = useState(true);
  const [isBase, setIsBase] = useState(true);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      await fetchDataForPage('funding-rates');
      setIsLoading(false);
    }
    loadData();
  }, []);

  const filteredExchangeData = getFilteredExchangeData(selectedOption);

  const LoadingSpinner = () => (
    <div className="flex justify-center items-center h-64">
      <svg className="animate-spin h-20 w-20 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
    </div>
  );

  return (
    <div className="bg-gray-900 min-h-screen text-white p-8">
      <h1 className="text-4xl font-bold mb-4 text-center">Funding Rates</h1>
      <div className='flex justify-center m-5 space-x-5'>
        <AprToggleSwitch isAPR={isAPR} setIsAPR={setIsAPR} />
        <TimeDropDown selectedOption={selectedOption} setSelectedOption={setSelectedOption} />
      </div>
      {isLoading ? <LoadingSpinner /> : (
        <FundingRateHeatMap data={filteredExchangeData} isAPR={isAPR}/>
      )}
      <h2 className="text-4xl font-bold mt-4 mb-4 text-center">Open Interest Stacked Chart</h2>
      <div className='flex justify-center m-5 space-x-5'>
        <AssetBaseToggleSwitch isBase={isBase} setIsBase={setIsBase}/>
      </div>
      {isLoading ? <LoadingSpinner /> : (
        <OpenInterestChart 
          data={filteredExchangeData} 
          isBase={isBase} 
          currentAssetPrice={assetPriceData ? assetPriceData : []}
        />
      )}
    </div>
  );
}
