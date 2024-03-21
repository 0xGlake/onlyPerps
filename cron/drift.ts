import { PublicKey } from '@solana/web3.js';
import { BN } from '@coral-xyz/anchor';
import { getRpcConnection } from './solanaHelper';

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
const main = async () => {

  const connection = await getRpcConnection();

	const privateKey = process.env.BOT_PRIVATE_KEY; // stored as an array string
	const keypair = Keypair.fromSecretKey(
		Uint8Array.from(JSON.parse(privateKey))
	);
	const wallet = new Wallet(keypair);


  const provider = new AnchorProvider(
		connection,
		wallet,
		AnchorProvider.defaultOptions()
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


  const perpMarketAccount = driftClient.getPerpMarketAccount(mkt.marketIndex);
  const markPrice =
              getMarketDataForMarket(marketId)?.derivedState?.markPrice ??
              BigNum.zero(PRICE_PRECISION_EXP);
  const baseAmount = BN.max(
              perpMarketAccount.amm.baseAssetAmountLong,
              perpMarketAccount.amm.baseAssetAmountShort.abs()
  );

  const openInterest =
              baseAmount && markPrice
                  ? BigNum.from(baseAmount, BASE_PRECISION_EXP).mul(markPrice).toNum()
                  : undefined;
              
}