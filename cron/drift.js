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
const solanaHelper_1 = require("./solanaHelper");
const sdk_1 = require("@drift-labs/sdk");
const main = () => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c;
    const connection = yield (0, solanaHelper_1.getRpcConnection)();
    const privateKey = process.env.BOT_PRIVATE_KEY; // stored as an array string
    const keypair = Keypair.fromSecretKey(Uint8Array.from(JSON.parse(privateKey)));
    const wallet = new sdk_1.Wallet(keypair);
    const provider = new AnchorProvider(connection, wallet, AnchorProvider.defaultOptions());
    const driftClient = new sdk_1.DriftClient(Object.assign(Object.assign({ connection, wallet: provider.wallet, programID: driftPublicKey }, (0, sdk_1.getMarketsAndOraclesForSubscription)(env)), { accountSubscription: {
            type: 'polling',
            accountLoader: bulkAccountLoader,
        } }));
    yield driftClient.subscribe();
    const perpMarketAccount = driftClient.getPerpMarketAccount(mkt.marketIndex);
    const markPrice = (_c = (_b = (_a = getMarketDataForMarket(marketId)) === null || _a === void 0 ? void 0 : _a.derivedState) === null || _b === void 0 ? void 0 : _b.markPrice) !== null && _c !== void 0 ? _c : BigNum.zero(PRICE_PRECISION_EXP);
    const baseAmount = anchor_1.BN.max(perpMarketAccount.amm.baseAssetAmountLong, perpMarketAccount.amm.baseAssetAmountShort.abs());
    const openInterest = baseAmount && markPrice
        ? BigNum.from(baseAmount, BASE_PRECISION_EXP).mul(markPrice).toNum()
        : undefined;
});
