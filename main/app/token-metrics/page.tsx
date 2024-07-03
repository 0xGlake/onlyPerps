'use client';

import '../styles/globals.css';
import { useState, useEffect } from 'react';
import { useDataStore, fetchDataForPage } from '../stores/useDataStore';
import TokenGraph from '../components/TokenGraph';
import LogarithmicOrLinearScaleToken from '../components/LogarithmicOrLinearScaleToken';

export default function TokenMetricsPage() {
  const { getProcessedTokenData } = useDataStore();
  const [isLogarithmic, setIsLogarithmic] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      await fetchDataForPage('token-metrics');
      setIsLoading(false);
    }
    loadData();
  }, []);

  const { fdvData, priceData, mcapData } = getProcessedTokenData();

  if (isLoading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  return (
    <div className="bg-gray-900 min-h-screen text-white p-8">
      <h1 className="text-4xl font-bold mb-4 text-center">Token Metrics</h1>
      <div className='flex justify-center m-5 space-x-5'>
        <LogarithmicOrLinearScaleToken isLogarithmic={isLogarithmic} setIsLogarithmic={setIsLogarithmic} />
      </div>
      <TokenGraph 
        data={fdvData} 
        isLogarithmic={isLogarithmic} 
        title="Fully Diluted Valuation"
        valueKey="fully_diluted_valuation"
      />
      {/* <TokenGraph 
        data={priceData} 
        isLogarithmic={isLogarithmic} 
        title="Price"
        valueKey="current_price"
      /> */}
      <TokenGraph 
        data={mcapData} 
        isLogarithmic={isLogarithmic} 
        title="Market Cap"
        valueKey="market_cap"
      />
    </div>
  );
}