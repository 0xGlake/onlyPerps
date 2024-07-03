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

  const { fdvData, mcapData } = getProcessedTokenData();

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
      <h1 className="text-4xl font-bold mb-4 text-center">Token Metrics</h1>
      <div className='flex justify-center m-5 space-x-5'>
        <LogarithmicOrLinearScaleToken isLogarithmic={isLogarithmic} setIsLogarithmic={setIsLogarithmic} />
      </div>
      {['Fully Diluted Valuation', 'Market Cap'].map((title, index) => (
        <div key={title}>
          {isLoading ? <LoadingSpinner /> : (
            <TokenGraph 
              data={[fdvData, mcapData][index]} 
              isLogarithmic={isLogarithmic} 
              title={title}
              valueKey={['fully_diluted_valuation', 'market_cap'][index]}
            />
          )}
        </div>
      ))}
    </div>
  );
}
