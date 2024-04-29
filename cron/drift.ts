import { AnchorProvider, BN, Wallet as DriftWallet } from '@coral-xyz/anchor';
import { Keypair, PublicKey } from '@solana/web3.js';
import {
	DriftClient,
	initialize,
	PerpMarkets,
	BulkAccountLoader,
	getMarketsAndOraclesForSubscription,
  //calculateLongShortFundingRate,
  calculateAllEstimatedFundingRate,
  BigNum,
  BASE_PRECISION_EXP,
  PRICE_PRECISION_EXP,
  FUNDING_RATE_PRECISION_EXP
} from '@drift-labs/sdk';
import { getRpcConnection } from './solanaHelper';
import { MainnetPerpMarkets } from './driftConstants'

export async function getDrift(tickers: string[]): Promise<{ [key: string]: { fundingRate: string, openInterest: string } }> {
	const env = 'mainnet-beta';
	// Initialize Drift SDK
	const sdkConfig = initialize({ env });

	//const privateKey = process.env.BOT_PRIVATE_KEY; // stored as an array string
  const newKeypair = Keypair.generate(); // just generate new keypair for each run
	const wallet = new DriftWallet(newKeypair);

  const connection = await getRpcConnection();

	const provider = new AnchorProvider(
		connection,
		wallet,
		AnchorProvider.defaultOptions()
	);

	// Set up the Drift Client
	const driftPublicKey = new PublicKey(sdkConfig.DRIFT_PROGRAM_ID);
	const bulkAccountLoader = new BulkAccountLoader(
		connection,
		'confirmed',
		1000
	);
	const driftClient = new DriftClient({
		connection,
		wallet: provider.wallet,
		programID: driftPublicKey,
		...getMarketsAndOraclesForSubscription(env),
		accountSubscription: {
			type: 'polling',
			accountLoader: bulkAccountLoader,
		},
	});
	await driftClient.subscribe();

  
  const results: { [key: string]: { fundingRate: string, openInterest: string } } = {};
  
  for (const asset of tickers) {
    const marketIndex = MainnetPerpMarkets[asset].marketIndex;
    const market = driftClient.getPerpMarketAccount(marketIndex);

    // uncomment if you want OI in USD not native
    // let priceData;
  
    // if (market && market.amm) {
    //   priceData = driftClient.getOraclePriceDataAndSlot(market.amm.oracle);
    // } else {
    //   throw new Error('Market or AMM is undefined');
    // }
    // const price = BigNum.from(priceData?.data.price, PRICE_PRECISION_EXP);
  
    //const quoteOIforMarket = price.toNum() * OI.toNum();
    
    const OI = BigNum.from(
      BN.max(
        market?.amm.baseAssetAmountLong,
        market?.amm.baseAssetAmountShort.abs()
        ),
      BASE_PRECISION_EXP
    );

    const quoteOIforMarket = OI.toNum();

    const [markTwapLive, oracleTwapLive, _2, cappedAltEst, interpEst] = await calculateAllEstimatedFundingRate(
      driftClient.getPerpMarketAccount(marketIndex)!,
      driftClient.getOracleDataForPerpMarket(marketIndex)
    );

    results[`${asset}-USD`] = {
      fundingRate: parseFloat(BigNum.from(cappedAltEst, FUNDING_RATE_PRECISION_EXP).toNum().toString()).toFixed(10).toString(),
      openInterest: quoteOIforMarket.toString().toString(),
    };
  }

  await driftClient.unsubscribe();
  return results;
};

//getDrift(['ETH', 'BTC', 'SOL']).then(res => console.log(res));
