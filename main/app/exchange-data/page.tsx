'use client';

import '../styles/globals.css';
import { useState, useEffect } from 'react';
import { useDataStore, fetchDataForPage } from '../stores/useDataStore';
import TokenGraph from '../components/TokenGraph';
import LogarithmicOrLinearScaleToken from '../components/LogarithmicOrLinearScaleToken';
import LoadingSpinner from '../components/LoadingSpinner';

export default function ExchangeDataPage() {
  const { getProcessedBroadExchangeData } = useDataStore();
  const [isLogarithmic, setIsLogarithmic] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      await fetchDataForPage('exchange-data');
      setIsLoading(false);
    }
    loadData();
  }, []);

  const { oiData, tvData } = getProcessedBroadExchangeData();

  return (
    <div className="bg-gray-900 min-h-screen text-white p-8 pt-20">
      <h1 className="text-4xl font-bold mb-4 text-center">Exchange Data</h1>
      <div className='flex justify-center m-8 space-x-5 mb-4'>
        <LogarithmicOrLinearScaleToken isLogarithmic={isLogarithmic} setIsLogarithmic={setIsLogarithmic} />
      </div>
      {isLoading ? <LoadingSpinner /> : (
        <TokenGraph
        data={oiData} 
        isLogarithmic={isLogarithmic} 
        title="Open Interest"
        valueKey="open_interest_usd"
      /> 
      )}
      {isLoading ? <LoadingSpinner /> : (
      <TokenGraph
        data={tvData} 
        isLogarithmic={isLogarithmic} 
        title="Trade Volume 24hr"
        valueKey="trade_volume_24h_usd"
      />
      )}
    </div>
  );
}
