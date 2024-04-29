import { AnchorProvider, BN, Wallet as DriftWallet } from '@coral-xyz/anchor';
//import { TOKEN_PROGRAM_ID } from '@solana/spl-token';
import { Keypair, PublicKey } from '@solana/web3.js';
import {
	DriftClient,
	initialize,
	//Wallet as DriftWallet,
	PerpMarkets,
	BulkAccountLoader,
	getMarketsAndOraclesForSubscription,

  calculateLongShortFundingRate,
  calculateAllEstimatedFundingRate,
  PerpMarketAccount,
  BigNum,
  BASE_PRECISION_EXP,
  PRICE_PRECISION_EXP,
  FUNDING_RATE_PRECISION_EXP
} from '@drift-labs/sdk';
import { getRpcConnection } from './solanaHelper';
import { MainnetPerpMarkets } from './driftConstants'

const getDrift = async () => {
	const env = 'mainnet-beta';
	// Initialize Drift SDK
	const sdkConfig = initialize({ env });

	// Set up the Wallet and Provider
	//const privateKey = process.env.BOT_PRIVATE_KEY; // stored as an array string
  const newKeypair = Keypair.generate(); // just generate new keypair for each run
	const wallet = new DriftWallet(newKeypair);

	// Set up the Connection
  const connection = await getRpcConnection();

	// Set up the Provider
	const provider = new AnchorProvider(
		connection,
		wallet,
		AnchorProvider.defaultOptions()
	);

	// Check SOL Balance
	//const lamportsBalance = await connection.getBalance(wallet.publicKey);
	//console.log('SOL balance:', lamportsBalance / 10 ** 9);

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


	// Get current price
	// const solMarketInfo = PerpMarkets[env].find(
	// 	(market) => market.baseAssetSymbol === 'SOL'
  // );

  const marketIndex = MainnetPerpMarkets['SOL'].marketIndex;
  const market = driftClient.getPerpMarketAccount(marketIndex);
  const OI = BigNum.from(
    BN.max(
      market?.amm.baseAssetAmountLong,
      market?.amm.baseAssetAmountShort.abs()
    ),
    BASE_PRECISION_EXP
  );

  let priceData;

  if (market && market.amm) {
    priceData = driftClient.getOraclePriceDataAndSlot(market.amm.oracle);
  } else {
    throw new Error('Market or AMM is undefined');
  }
  const price = BigNum.from(priceData?.data.price, PRICE_PRECISION_EXP);

  const quoteOIforMarket = price.toNum() * OI.toNum();

  console.log(quoteOIforMarket);

  const [markTwapLive, oracleTwapLive, _2, cappedAltEst, interpEst] = await calculateAllEstimatedFundingRate(
    driftClient.getPerpMarketAccount(1)!, 
    driftClient.getOracleDataForPerpMarket(1)
  );

  console.log(BigNum.from(cappedAltEst, FUNDING_RATE_PRECISION_EXP).toNum() + "         :)        " + BigNum.from(interpEst, FUNDING_RATE_PRECISION_EXP).toNum());

  return driftClient;
};

getDrift();
