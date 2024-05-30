"use client";
import React from 'react';

type FilteredData = {
  id: number;
  timestamp: string;
  data: {
    [exchangeKey: string]: {
      fully_diluted_valuation : number;
      current_price : number;
      market_cap : number;
    };
  };
}[];

type FullyDillutedValueProps = {
  data: FilteredData;
};

const FullyDillutedValue: React.FC<FullyDillutedValueProps> = ({ data }) => {
  return (
    <div>
      <h2>Fully Diluted Valuation Chart</h2>
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </div>
  );
};

export default FullyDillutedValue;