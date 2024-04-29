"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDrift = void 0;
const anchor_1 = require("@coral-xyz/anchor");
const web3_js_1 = require("@solana/web3.js");
const sdk_1 = require("@drift-labs/sdk");
const solanaHelper_1 = require("./solanaHelper");
const driftConstants_1 = require("./driftConstants");
function getDrift(tickers) {
    return __awaiter(this, void 0, void 0, function* () {
        const env = 'mainnet-beta';
        // Initialize Drift SDK
        const sdkConfig = (0, sdk_1.initialize)({ env });
        //const privateKey = process.env.BOT_PRIVATE_KEY; // stored as an array string
        const newKeypair = web3_js_1.Keypair.generate(); // just generate new keypair for each run
        const wallet = new anchor_1.Wallet(newKeypair);
        const connection = yield (0, solanaHelper_1.getRpcConnection)();
        const provider = new anchor_1.AnchorProvider(connection, wallet, anchor_1.AnchorProvider.defaultOptions());
        // Set up the Drift Client
        const driftPublicKey = new web3_js_1.PublicKey(sdkConfig.DRIFT_PROGRAM_ID);
        const bulkAccountLoader = new sdk_1.BulkAccountLoader(connection, 'confirmed', 1000);
        const driftClient = new sdk_1.DriftClient(Object.assign(Object.assign({ connection, wallet: provider.wallet, programID: driftPublicKey }, (0, sdk_1.getMarketsAndOraclesForSubscription)(env)), { accountSubscription: {
                type: 'polling',
                accountLoader: bulkAccountLoader,
            } }));
        yield driftClient.subscribe();
        const results = {};
        for (const asset of tickers) {
            const marketIndex = driftConstants_1.MainnetPerpMarkets[asset].marketIndex;
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
            const OI = sdk_1.BigNum.from(anchor_1.BN.max(market === null || market === void 0 ? void 0 : market.amm.baseAssetAmountLong, market === null || market === void 0 ? void 0 : market.amm.baseAssetAmountShort.abs()), sdk_1.BASE_PRECISION_EXP);
            const quoteOIforMarket = OI.toNum();
            const [markTwapLive, oracleTwapLive, _2, cappedAltEst, interpEst] = yield (0, sdk_1.calculateAllEstimatedFundingRate)(driftClient.getPerpMarketAccount(marketIndex), driftClient.getOracleDataForPerpMarket(marketIndex));
            results[`${asset}-USD`] = {
                fundingRate: parseFloat(sdk_1.BigNum.from(cappedAltEst, sdk_1.FUNDING_RATE_PRECISION_EXP).toNum().toString()).toFixed(10).toString(),
                openInterest: quoteOIforMarket.toString().toString(),
            };
        }
        yield driftClient.unsubscribe();
        return results;
    });
}
exports.getDrift = getDrift;
;
//getDrift(['ETH', 'BTC', 'SOL']).then(res => console.log(res));
