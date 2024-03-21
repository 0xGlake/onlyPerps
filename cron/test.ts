import { AnchorProvider, BN } from '@coral-xyz/anchor';
import { Token, TOKEN_PROGRAM_ID } from '@solana/spl-token';
import { Connection, Keypair, PublicKey } from '@solana/web3.js';
import {
	calculateReservePrice,
	DriftClient,
	User,
	initialize,
	PositionDirection,
	convertToNumber,
	calculateTradeSlippage,
	PRICE_PRECISION,
	QUOTE_PRECISION,
	Wallet,
	PerpMarkets,
	BASE_PRECISION,
	getMarketOrderParams,
	BulkAccountLoader,
	getMarketsAndOraclesForSubscription
} from '@drift-labs/sdk';
import { getRpcConnection } from './solanaHelper';

export const getTokenAddress = (
	mintAddress: string,
	userPubKey: string
): Promise<PublicKey> => {
	return Token.getAssociatedTokenAddress(
		new PublicKey(`ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL`),
		TOKEN_PROGRAM_ID,
		new PublicKey(mintAddress),
		new PublicKey(userPubKey)
	);
};

const main = async () => {
	const env = 'mainnet';
	// Initialize Drift SDK
	const sdkConfig = initialize({ env });

	// Set up the Wallet and Provider
	//const privateKey = process.env.BOT_PRIVATE_KEY; // stored as an array string
  const newKeypair = Keypair.generate();

	// const keypair = Keypair.fromSecretKey(
	// 	Uint8Array.from(JSON.parse(privateKey))
	// );
	const wallet = new Wallet(newKeypair);
  

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
  console.log(solMarketInfo);
};

main();