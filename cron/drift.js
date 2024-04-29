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
const anchor_1 = require("@coral-xyz/anchor");
//import { TOKEN_PROGRAM_ID } from '@solana/spl-token';
const web3_js_1 = require("@solana/web3.js");
const sdk_1 = require("@drift-labs/sdk");
const solanaHelper_1 = require("./solanaHelper");
const driftConstants_1 = require("./driftConstants");
const getDrift = () => __awaiter(void 0, void 0, void 0, function* () {
    const env = 'mainnet-beta';
    // Initialize Drift SDK
    const sdkConfig = (0, sdk_1.initialize)({ env });
    // Set up the Wallet and Provider
    //const privateKey = process.env.BOT_PRIVATE_KEY; // stored as an array string
    const newKeypair = web3_js_1.Keypair.generate(); // just generate new keypair for each run
    const wallet = new anchor_1.Wallet(newKeypair);
    // Set up the Connection
    const connection = yield (0, solanaHelper_1.getRpcConnection)();
    // Set up the Provider
    const provider = new anchor_1.AnchorProvider(connection, wallet, anchor_1.AnchorProvider.defaultOptions());
    // Check SOL Balance
    const lamportsBalance = yield connection.getBalance(wallet.publicKey);
    //console.log('SOL balance:', lamportsBalance / 10 ** 9);
    // Set up the Drift Client
    const driftPublicKey = new web3_js_1.PublicKey(sdkConfig.DRIFT_PROGRAM_ID);
    const bulkAccountLoader = new sdk_1.BulkAccountLoader(connection, 'confirmed', 1000);
    const driftClient = new sdk_1.DriftClient(Object.assign(Object.assign({ connection, wallet: provider.wallet, programID: driftPublicKey }, (0, sdk_1.getMarketsAndOraclesForSubscription)(env)), { accountSubscription: {
            type: 'polling',
            accountLoader: bulkAccountLoader,
        } }));
    yield driftClient.subscribe();
    // Get current price
    const solMarketInfo = sdk_1.PerpMarkets[env].find((market) => market.baseAssetSymbol === 'SOL');
    const marketIndex = driftConstants_1.MainnetPerpMarkets['SOL'].marketIndex;
    const market = driftClient.getPerpMarketAccount(marketIndex);
    const OI = sdk_1.BigNum.from(anchor_1.BN.max(market === null || market === void 0 ? void 0 : market.amm.baseAssetAmountLong, market === null || market === void 0 ? void 0 : market.amm.baseAssetAmountShort.abs()), sdk_1.BASE_PRECISION_EXP);
    let priceData;
    if (market && market.amm) {
        priceData = driftClient.getOraclePriceDataAndSlot(market.amm.oracle);
    }
    else {
        throw new Error('Market or AMM is undefined');
    }
    const price = sdk_1.BigNum.from(priceData === null || priceData === void 0 ? void 0 : priceData.data.price, sdk_1.PRICE_PRECISION_EXP);
    const quoteOIforMarket = price.toNum() * OI.toNum();
    console.log(quoteOIforMarket);
    const [markTwapLive, oracleTwapLive, _2, cappedAltEst, interpEst] = yield (0, sdk_1.calculateAllEstimatedFundingRate)(driftClient.getPerpMarketAccount(1), driftClient.getOracleDataForPerpMarket(1));
    console.log(sdk_1.BigNum.from(cappedAltEst.val) + "         :)        " + sdk_1.BigNum.from(interpEst).toString());
    return driftClient;
});
getDrift();
