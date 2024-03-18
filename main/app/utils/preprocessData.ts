type FundingRateData = {
  [key: string]: {
    [key: string]: {
      fundingRate: string;
      openInterest: string;
    };
  };
};

export function preprocessData(data: FundingRateData[]): FundingRateData[] {
  if (!data || data.length === 0) {
    return [];
  }

  const exchanges = Object.keys(data[0]).filter(
    (key) => key !== 'id' && key !== 'timestamp'
  );
  const assets = Object.keys(data[0][exchanges[0]]);

  data.forEach((d) => {
    for (const exchange of exchanges) {
      let prevFundingRates: Record<string, string> = {};
      let prevOpenInterests: Record<string, string> = {};

      for (const asset of assets) {
        const fundingRate = d[exchange]?.[asset]?.fundingRate;
        const openInterest = d[exchange]?.[asset]?.openInterest;

        if (fundingRate === null || fundingRate === undefined) {
          d[exchange][asset].fundingRate = prevFundingRates[asset];
        } else {
          prevFundingRates[asset] = fundingRate;
        }

        if (openInterest === null || openInterest === undefined) {
          d[exchange][asset].openInterest = prevOpenInterests[asset];
        } else {
          prevOpenInterests[asset] = openInterest;
        }
      }
    }
  });

  return data;
}