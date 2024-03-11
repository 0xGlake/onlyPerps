// async function getHyper() {
//   const url = "https://api.hyperliquid.xyz/info";
//   const headers = { "Content-Type": "application/json" };
//   const body = { type: "metaAndAssetCtxs" };

//   try {
//     const response = await fetch(url, {
//       method: "POST",
//       headers,
//       body: JSON.stringify(body),
//     });

//     if (!response.ok) {
//       throw new Error(`HTTP error ${response.status}`);
//     }

//     const data = await response.json();
//     // console.log(data[0]['universe'][0]);
//     // console.log(data[1][0]);
//     const combinedData = data[0]['universe'].map((item: string, index: number) => {
//       return { universe: item, associatedData: data[1][index] };
//     });
    
//     console.log(combinedData);

//   } catch (error) {
//     console.error("Error:", error);
//   }
// }

// getHyper();


interface UniverseItem {
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
        const index = data[0]['universe'].findIndex((item: UniverseItem) => item.name === ticker);
        if (index !== -1) {
          const associatedData = data[1][index];
          acc[`${ticker}-USD`] = {
            fundingRate: associatedData.funding,
            openInterest: associatedData.openInterest
          };
        }
        return acc;
      }, {});
      return filteredData;
    } else {
      throw new Error('Data structure is not as expected or arrays do not match in length.');
    }
  } catch (error) {
    console.error("Error:", error);
    return {}; // Return an empty object or handle the error as needed
  }
}

// Example usage
getHyper(['BTC', 'ETH', 'SOL']).then(data => {
    console.log(data);
  }).catch(error => {
    console.error('Error fetching filtered data:', error);
  });


