"use client";
import React from 'react';

type OpenInterestData = {
  [key: string]: {
    [key: string]: string;
  };
};

type Props = {
  data: {
    id: number;
    timestamp: string;
    [key: string]: OpenInterestData | number | string;
  }[];
};

const OpenInterestChart: React.FC<Props> = ({ data }) => {
  if (!data || data.length === 0) {
    return <div>No data available.</div>;
  }

  // Extract the open interest data
  const openInterestData = data.map((d) => {
    const openInterest: { [key: string]: number } = {};
    Object.entries(d).forEach(([key, value]) => {
      if (typeof value === 'object' && value !== null) {
        const typedValue = value as OpenInterestData;
        Object.entries(typedValue).forEach(([asset, assetData]) => {
          openInterest[`${asset}-${key}`] = parseFloat(assetData.openInterest);
        });
      }
    });
    return openInterest;
  });

  // Print the open interest data on the screen
  return (
    <div>
      <h2>Open Interest Data:</h2>
      <pre>{JSON.stringify(openInterestData, null, 2)}</pre>
    </div>
  );
};

export default OpenInterestChart;