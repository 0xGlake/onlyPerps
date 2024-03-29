interface HyperMarket {
  name: string;
  funding: string;
  openInterest: string;
  premium: string;
}

export async function getHyper(tickers: string[]): Promise<{ [key: string]: { fundingRate: string, openInterest: string } }> {
  const url = "https://api.hyperliquid.xyz/info";
  const headers = { "Content-Type": "application/json" };
  const body = { type: "metaAndAssetCtxs" };

  try {
    const response = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      throw new Error(`HTTP error ${response.status}`);
    }

    const data = await response.json();

    if (Array.isArray(data[0]['universe']) && Array.isArray(data[1]) && data[0]['universe'].length === data[1].length) {
      const filteredData = tickers.reduce<{ [key: string]: { fundingRate: string, openInterest: string } }>((acc, ticker) => {
        const index = data[0]['universe'].findIndex((item: HyperMarket) => item.name === ticker);
        if (index !== -1) {
          const associatedData = data[1][index];
          acc[`${ticker}-USD`] = {
            fundingRate: associatedData.funding,
            openInterest: associatedData.openInterest
          };
        }
        return acc;
      }, {});
      // TODO: check if filtered data is {} and throw error instead of returning
      return filteredData;
    } else {
      throw new Error('Data structure is not as expected or arrays do not match in length.');
    }
  } catch (error) {
    console.error("Error:", error);
    return {}; // Return an empty object or handle the error as needed
  }
}

