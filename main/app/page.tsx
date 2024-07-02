'use client';

import { useState, useEffect, useMemo } from 'react';
import '../app/styles/globals.css';
import FundingRateHeatMap from '../app/components/FundingRateHeatMap';
import OpenInterestChart from '../app/components/OpenInterestStackedChart';
import AprToggleSwitch from './components/AprToggleSwitch';
import AssetBaseToggleSwitch from './components/AssetBaseToggleSwitch';
import TimeDropDown from './components/TimeDropDown';
import TokenGraph from './components/TokenGraph';
import LogarithmicOrLinearScaleToken from './components/LogarithmicOrLinearScaleToken';

type ExchangeData = {
  [key: string]: {
    [key: string]: {
      fundingRate: string;
      openInterest: string;
    };
  };
};

type AssetPriceData = {
  symbol: string;
  price: string;
}

type TokenData = {
  id: number;
  timestamp: string;
  data: {
    [exchangeKey: string]: {
      fully_diluted_valuation : number;
      current_price : number;
      market_cap : number;
    };
  };
};

type BroadExchangeData = {
  id: number;
  timestamp: string;
  data: {
    [exchangeKey: string]: {
      open_interest_usd : number;
      trade_volume_24h_usd : number;
    };
  };
};

type GraphData = {
  timestamp: string;
  [exchangeKey: string]: number | string;
};

async function FundingRateData(): Promise<ExchangeData[]> {
  const response = await fetch(`http://localhost:3000/api/fundingAndOI`);
  return await response.json();
}

async function getAssetPrice(): Promise<AssetPriceData[]> {
  // todo: make the fetch more general and not hardcoded
  const response = await fetch(`https://api.binance.com/api/v3/ticker/price?symbols=[%22BTCUSDT%22,%22ETHUSDT%22,%22SOLUSDT%22]`);
  return await response.json();
}

async function getTokenData(): Promise<TokenData[]> {
  const response = await fetch(`http://localhost:3000/api/tokens`);
  return await response.json();
}

async function getExchangesData(): Promise<BroadExchangeData[]> {
  const response = await fetch(`http://localhost:3000/api/exchanges`);
  return await response.json();
}

function filterData(data: ExchangeData[], selectedOption: string): ExchangeData[] {
  const timeframes: { [key: string]: number } = {
    '1-Day': 96,
    '3-Days': 96*3,
    '7-Days': 96*7,
    // '1-Month': 96*30,
    // '3-Months': 96*90,
  };

  const timeframe = timeframes[selectedOption];
  return data.slice(0, timeframe);
}

function processTokenData(tokenData: TokenData[]): {
  fdvData: GraphData[];
  priceData: GraphData[];
  mcapData: GraphData[];
} {
  const fdvData: GraphData[] = [];
  const priceData: GraphData[] = [];
  const mcapData: GraphData[] = [];

  tokenData.forEach((item) => {
    const fdvItem: GraphData = { timestamp: item.timestamp };
    const priceItem: GraphData = { timestamp: item.timestamp };
    const mcapItem: GraphData = { timestamp: item.timestamp };

    Object.entries(item.data).forEach(([exchange, values]) => {
      fdvItem[exchange] = values.fully_diluted_valuation;
      priceItem[exchange] = values.current_price;
      mcapItem[exchange] = values.market_cap;
    });

    fdvData.push(fdvItem);
    priceData.push(priceItem);
    mcapData.push(mcapItem);
  });

  return { fdvData, priceData, mcapData };
}

function processBroadExchangeData(broadExchangeData: BroadExchangeData[]): {
  oiData: GraphData[];
  tvData: GraphData[];
} {
  const oiData: GraphData[] = [];
  const tvData: GraphData[] = [];

  broadExchangeData.forEach((item) => {
    const oiItem: GraphData = { timestamp: item.timestamp };
    const tvItem: GraphData = { timestamp: item.timestamp };

    Object.entries(item.data).forEach(([exchange, values]) => {
      oiItem[exchange] = values.open_interest_usd;
      tvItem[exchange] = values.trade_volume_24h_usd;
    });

    oiData.push(oiItem);
    tvData.push(tvItem);
  });

  return { oiData, tvData };
}

export default function Home() {
  const [selectedOption, setSelectedOption] = useState('7-Days');
  const [isAPR, setIsAPR] = useState(true)
  const [isBase, setIsBase] = useState(true)
  const [isLogarithmic, setIsLogarithmic] = useState(false);
  const [data, setData] = useState<ExchangeData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentAssetPrice, setCurrentAssetPrice] = useState<AssetPriceData[]>([]);
  const [tokenData, setTokenData] = useState<TokenData[]>([]);
  const [BroadExchangeData, setBroadExchangeData] = useState<BroadExchangeData[]>([]);

  const [fullyDilutedValuationData, setFullyDilutedValuationData] = useState<GraphData[]>([]);
  //const [currentPriceData, setCurrentPriceData] = useState<GraphData[]>([]);
  const [marketCapData, setMarketCapData] = useState<GraphData[]>([]);
  const [oiData, setOiData] = useState<GraphData[]>([]);
  const [tvData, setTvData] = useState<GraphData[]>([]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [fetchedData, assetPriceData, tokenData, BroadExchangeData] = await Promise.all([
        FundingRateData(),
        getAssetPrice(),
        getTokenData(),
        getExchangesData(),
      ]);
      setData(fetchedData);
      setCurrentAssetPrice(assetPriceData);
      setTokenData(tokenData);
      setBroadExchangeData(BroadExchangeData);

      const { fdvData, priceData, mcapData } = processTokenData(tokenData);
      const { oiData, tvData } = processBroadExchangeData(BroadExchangeData);

      setFullyDilutedValuationData(fdvData);
      //setCurrentPriceData(priceData);
      setMarketCapData(mcapData);
      setOiData(oiData);
      setTvData(tvData);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
    setIsLoading(false);
  };

  useEffect(() => {  
    fetchData();
  }, []);

  const memoizedFilteredData = useMemo(
    () => filterData(data, selectedOption), // the usememo action to perform
    [data, selectedOption]
  ); // the dependencies that will trigger the usememo action

  return (
    <div className="bg-gray-900 min-h-screen text-white p-8">
      <h1 className="text-4xl font-bold mb-0 text-center">Funding Rate Heat Map</h1>
      <div className='flex justify-center m-5 space-x-5'>
        <AprToggleSwitch isAPR={isAPR} setIsAPR={setIsAPR} />
        <TimeDropDown selectedOption={selectedOption} setSelectedOption={setSelectedOption} />
      </div>
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <svg className="animate-spin h-20 w-20 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>
      ) : (
        <>
          <FundingRateHeatMap data={memoizedFilteredData} isAPR={isAPR}/>
          <h1 className="text-4xl font-bold mt-8 mb-4 text-center">Open Interest Stacked Chart</h1>
          <div className='flex justify-center m-5 space-x-5'>
            <AssetBaseToggleSwitch isBase={isBase} setIsBase={setIsBase}/>
          </div>
          <OpenInterestChart data={memoizedFilteredData} isBase={isBase} currentAssetPrice={currentAssetPrice}/>
          {/*
          <h1 className="text-4xl font-bold mt-8 mb-4 text-center">Fully Dilluted Value</h1>
          <div className='flex justify-center m-5 space-x-5'>
            <LogarithmicOrLinearScaleToken isLogarithmic={isLogarithmic} setIsLogarithmic={setIsLogarithmic} />
          </div>
          <TokenGraph data={tokenData} isLogarithmic={isLogarithmic} /> 
          */}
          <h1 className="text-4xl font-bold mt-8 mb-4 text-center">Token Metrics</h1>
          <div className='flex justify-center m-5 space-x-5'>
            <LogarithmicOrLinearScaleToken isLogarithmic={isLogarithmic} setIsLogarithmic={setIsLogarithmic} />
          </div>
          
          <TokenGraph 
            data={fullyDilutedValuationData} 
            isLogarithmic={isLogarithmic} 
            title="Fully Diluted Valuation"
            valueKey="fully_diluted_valuation"
          />
          
          {/* <TokenGraph 
            data={currentPriceData} 
            isLogarithmic={isLogarithmic} 
            title="Current Price"
            valueKey="current_price"
          /> */}
          
          <TokenGraph 
            data={marketCapData} 
            isLogarithmic={isLogarithmic} 
            title="Market Cap"
            valueKey="market_cap"
          />

          <TokenGraph 
            data={oiData} 
            isLogarithmic={isLogarithmic} 
            title="Open Interest"
            valueKey="open_interest_usd"
          />

          <TokenGraph 
            data={tvData} 
            isLogarithmic={isLogarithmic} 
            title="Trade Volume 24hr"
            valueKey="trade_volume_24h_usd"
          />
          </>
          
      )}
    </div>
  );
}
