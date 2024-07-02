import { create } from 'zustand';

// Define your data types here

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

// Main data store
interface DataStore {
  exchangeData: ExchangeData[] | null;
  assetPriceData: AssetPriceData[] | null;
  tokenData: TokenData[] | null;
  broadExchangeData: BroadExchangeData[] | null;
  setExchangeData: (data: ExchangeData[]) => void;
  setAssetPriceData: (data: AssetPriceData[]) => void;
  setTokenData: (data: TokenData[]) => void;
  setBroadExchangeData: (data: BroadExchangeData[]) => void;
  getFilteredExchangeData: (selectedOption: string) => ExchangeData[];
  getProcessedTokenData: () => {
    fdvData: GraphData[];
    priceData: GraphData[];
    mcapData: GraphData[];
  };
  getProcessedBroadExchangeData: () => {
    oiData: GraphData[];
    tvData: GraphData[];
  };
}

export const useDataStore = create<DataStore>((set, get) => ({
  exchangeData: null,
  assetPriceData: null,
  tokenData: null,
  broadExchangeData: null,
  setExchangeData: (data) => set({ exchangeData: data }),
  setAssetPriceData: (data) => set({ assetPriceData: data }),
  setTokenData: (data) => set({ tokenData: data }),
  setBroadExchangeData: (data) => set({ broadExchangeData: data }),
  getFilteredExchangeData: (selectedOption) => {
    const { exchangeData } = get();
    if (!exchangeData) return [];
    
    const timeframes: { [key: string]: number } = {
      '1-Day': 96,
      '3-Days': 96*3,
      '7-Days': 96*7,
      // '1-Month': 96*30,
      // '3-Months': 96*90,
    };
    const timeframe = timeframes[selectedOption];
    return exchangeData.slice(0, timeframe);
  },
  getProcessedTokenData: () => {
    const { tokenData } = get();
    if (!tokenData) return { fdvData: [], priceData: [], mcapData: [] };
    
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
  },
  getProcessedBroadExchangeData: () => {
    const { broadExchangeData } = get();
    if (!broadExchangeData) return { oiData: [], tvData: [] };
    
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
  },
}));

// Timestamp store (unchanged)
interface TimestampStore {
  timestamps: Record<string, number>;
  updateTimestamp: (key: string) => void;
}

export const useTimestampStore = create<TimestampStore>((set) => ({
  timestamps: {},
  updateTimestamp: (key) => set((state) => ({
    timestamps: { ...state.timestamps, [key]: Date.now() }
  })),
}));

const STALE_TIME = 15 * 60 * 1000; // 15 minutes in milliseconds

// Helper function to check if data is stale (unchanged)
export function isDataStale(key: string): boolean {
  const { timestamps } = useTimestampStore.getState();
  const lastFetchTime = timestamps[key];
  return !lastFetchTime || (Date.now() - lastFetchTime > STALE_TIME);
}

// Data fetching functions (unchanged)
export async function fetchExchangeData() {
  const response = await fetch(`http://localhost:3000/api/fundingAndOI`);
  return await response.json();
}

export async function fetchAssetPriceData() {
  const response = await fetch(`https://api.binance.com/api/v3/ticker/price?symbols=[%22BTCUSDT%22,%22ETHUSDT%22,%22SOLUSDT%22]`);
  return await response.json();
}

export async function fetchTokenData() {
  const response = await fetch(`http://localhost:3000/api/tokens`);
  return await response.json();
}

export async function fetchBroadExchangeData() {
  const response = await fetch(`http://localhost:3000/api/exchanges`);
  return await response.json();
}

// Function to fetch data for a specific page (unchanged)
export async function fetchDataForPage(pageName: string) {
  const dataStore = useDataStore.getState();
  const { updateTimestamp } = useTimestampStore.getState();

  switch (pageName) {
    case 'funding-rates':
      if (isDataStale('exchangeData')) {
        const data = await fetchExchangeData();
        dataStore.setExchangeData(data);
        updateTimestamp('exchangeData');
      }
      if (isDataStale('assetPriceData')) {
        const data = await fetchAssetPriceData();
        dataStore.setAssetPriceData(data);
        updateTimestamp('assetPriceData');
      }
      break;
    case 'token-metrics':
      if (isDataStale('tokenData')) {
        const data = await fetchTokenData();
        dataStore.setTokenData(data);
        updateTimestamp('tokenData');
      }
      break;
    case 'exchange-data':
      if (isDataStale('broadExchangeData')) {
        const data = await fetchBroadExchangeData();
        dataStore.setBroadExchangeData(data);
        updateTimestamp('broadExchangeData');
      }
      break;
    default:
      console.error('Unknown page name:', pageName);
  }
}
