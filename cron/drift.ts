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

  calculateAllEstimatedFundingRate,
  PerpMarketAccount,
  BigNum,
  BASE_PRECISION_EXP,
  PRICE_PRECISION_EXP
} from '@drift-labs/sdk';
import { getRpcConnection } from './solanaHelper';

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
	const lamportsBalance = await connection.getBalance(wallet.publicKey);
	console.log('SOL balance:', lamportsBalance / 10 ** 9);

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
	const solMarketInfo = PerpMarkets[env].find(
		(market) => market.baseAssetSymbol === 'SOL'
  );

  const marketIndex = 0; //TODO THIS IS SOL MARKET
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
  //console.log(solMarketInfo);
  //console.log(PerpMarkets[env]);


  return driftClient;
};

getDrift();
