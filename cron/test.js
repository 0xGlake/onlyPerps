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
const main = () => __awaiter(void 0, void 0, void 0, function* () {
    const env = 'mainnet-beta';
    // Initialize Drift SDK
    const sdkConfig = (0, sdk_1.initialize)({ env });
    // Set up the Wallet and Provider
    //const privateKey = process.env.BOT_PRIVATE_KEY; // stored as an array string
    const newKeypair = web3_js_1.Keypair.generate();
    // const keypair = Keypair.fromSecretKey(
    // 	Uint8Array.from(JSON.parse(privateKey))
    // );
    const wallet = new anchor_1.Wallet(newKeypair);
    // Set up the Connection
    const connection = yield (0, solanaHelper_1.getRpcConnection)();
    // Set up the Provider
    const provider = new anchor_1.AnchorProvider(connection, wallet, anchor_1.AnchorProvider.defaultOptions());
    // Check SOL Balance
    const lamportsBalance = yield connection.getBalance(wallet.publicKey);
    console.log('SOL balance:', lamportsBalance / 10 ** 9);
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
    console.log(solMarketInfo);
});
main();
