'use client';

import React, { useState, useEffect } from 'react';
import { useTimestampStore } from '../stores/useDataStore';
import { usePathname } from 'next/navigation';
import { fetchDataForPage } from '../stores/useDataStore';

const STALE_TIME = 5 * 60 * 1000; // 5 minutes

const pageDataKeys = {
  '/funding-rates': ['exchangeData', 'assetPriceData'],
  '/token-metrics': ['tokenData'],
  '/exchange-data': ['broadExchangeData'],
  '/': ['exchangeData', 'assetPriceData', 'tokenData', 'broadExchangeData'], // for the home page
};

export default function StaleDataCountdownFooter() {
  const { timestamps } = useTimestampStore();
  const [leastFreshData, setLeastFreshData] = useState<{ key: string; freshness: number } | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const pathname = usePathname();

  const relevantDataKeys = pageDataKeys[pathname as keyof typeof pageDataKeys] || [];

  useEffect(() => {
    const interval = setInterval(() => {
      let leastFresh = { key: '', freshness: 1 };
      relevantDataKeys.forEach(key => {
        const lastFetchTime = timestamps[key];
        if (lastFetchTime) {
          const elapsed = Date.now() - lastFetchTime;
          const freshness = Math.max(0, 1 - elapsed / STALE_TIME);
          if (freshness < leastFresh.freshness) {
            leastFresh = { key, freshness };
          }
        } else {
          leastFresh = { key, freshness: 0 };
        }
      });
      setLeastFreshData(leastFresh.key ? leastFresh : null);
    }, 1000);

    return () => clearInterval(interval);
  }, [timestamps, relevantDataKeys]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    const pageName = pathname === '/' ? 'home' : pathname.slice(1);
    await fetchDataForPage(pageName);
    setIsRefreshing(false);
  };

  if (!leastFreshData) return null;

  const percentage = Math.round(leastFreshData.freshness * 100);
  const circumference = 2 * Math.PI * 20; // 20 is the radius of the circle
  const strokeDashoffset = circumference * (1 - leastFreshData.freshness);
  const color = percentage < 10 ? 'text-red-500' : 'text-blue-500';

  return (
    <footer className="fixed bottom-4 right-4 bg-gray-800 text-white p-4 rounded-full shadow-lg content-center">
      <p className="text-xs ">Data Staleness</p>
      <button 
        onClick={handleRefresh}
        disabled={isRefreshing}
        className="relative w-16 h-16 focus:outline-none"
        title="Click to refresh data"
      >
        <svg className="w-full h-full" viewBox="0 0 44 44">
          <circle
            className="text-gray-600"
            stroke="currentColor"
            strokeWidth="4"
            fill="transparent"
            r="20"
            cx="22"
            cy="22"
          />
          <circle
            className={color}
            stroke="currentColor"
            strokeWidth="4"
            strokeLinecap="round"
            fill="transparent"
            r="20"
            cx="22"
            cy="22"
            style={{
              strokeDasharray: circumference,
              strokeDashoffset: strokeDashoffset,
              transform: 'rotate(-90deg)',
              transformOrigin: 'center',
            }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          {isRefreshing ? (
            <span className="animate-spin">↻</span>
          ) : (
            <span className="text-sm font-semibold">{percentage}%</span>
          )}
        </div>
      </button>
    </footer>
  );
}
