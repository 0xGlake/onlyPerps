'use client';

import '../styles/globals.css';
import { useState, useEffect } from 'react';
import { useDataStore, fetchDataForPage } from '../stores/useDataStore';
import TokenGraph from '../components/TokenGraph';
import LogarithmicOrLinearScaleToken from '../components/LogarithmicOrLinearScaleToken';
import LoadingSpinner from '../components/LoadingSpinner';

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

  return (
    <div className="bg-gray-900 min-h-screen text-white p-8 pt-20">
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
