'use client';

import './styles/globals.css';
import { useEffect } from 'react';
import Link from 'next/link';
import { useDataStore, fetchDataForPage } from './stores/useDataStore';

export default function Home() {
  const { 
    exchangeData, 
    assetPriceData, 
    tokenData,
    broadExchangeData 
  } = useDataStore();

  useEffect(() => {
    // Pre-fetch all data when the main page loads
    fetchDataForPage('funding-rates');
    fetchDataForPage('token-metrics');
    fetchDataForPage('exchange-data');
  }, []);

  return (
    <div className="bg-gray-900 min-h-screen text-white p-8 flex flex-col items-center justify-center">
      <h1 className="text-4xl font-bold mb-8 text-center">Dashboard Navigation</h1>
      <div className="flex flex-col space-y-4">
        <Link 
          href="/funding-rates" 
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded text-center"
        >
          Funding Rates
          {exchangeData && assetPriceData ? ' (Data Loaded)' : ' (Loading...)'}
        </Link>
        <Link 
          href="/token-metrics" 
          className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded text-center"
        >
          Token Metrics
          {tokenData ? ' (Data Loaded)' : ' (Loading...)'}
        </Link>
        <Link 
          href="/exchange-data" 
          className="bg-purple-500 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded text-center"
        >
          Exchange Data
          {broadExchangeData ? ' (Data Loaded)' : ' (Loading...)'}
        </Link>
      </div>
    </div>
  );
}
