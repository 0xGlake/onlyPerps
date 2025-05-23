'use client';

import '../styles/globals.css';

import { useState, useEffect } from 'react';
import { useDataStore, fetchDataForPage } from '../stores/useDataStore';
import FundingRateHeatMap from '../components/FundingRateHeatMap';
import OpenInterestChart from '../components/OpenInterestStackedChart';
import AprToggleSwitch from '../components/AprToggleSwitch';
import AssetBaseToggleSwitch from '../components/AssetBaseToggleSwitch';
import TimeDropDown from '../components/TimeDropDown';
import LoadingSpinner from '../components/LoadingSpinner';

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

  return (
    <div className="bg-gray-900 min-h-screen text-white p-8 pt-20">
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
