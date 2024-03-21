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
exports.getAevo = void 0;
function getAevo(tickers, maxRetries = 3, retryDelay = 1000) {
    return __awaiter(this, void 0, void 0, function* () {
        const result = {};
        for (const ticker of tickers) {
            let retries = 0;
            let data = null;
            while (retries < maxRetries) {
                const url = `https://api.aevo.xyz/instrument/${ticker}-PERP`;
                const response = yield fetch(url, {
                    headers: {
                        'accept': 'application/json'
                    }
                });
                if (!response.ok) {
                    throw new Error(`HTTP error ${response.status}`);
                }
                data = yield response.json();
                if (data !== null && data.funding_rate !== null && data.markets.total_oi !== null) {
                    break;
                }
                retries++;
                yield new Promise(resolve => setTimeout(resolve, retryDelay));
            }
            if (data !== null) {
                result[`${ticker}-USD`] = {
                    fundingRate: data.funding_rate,
                    openInterest: data.markets.total_oi,
                    //dailyVolume: data.markets.daily_volume
                };
            }
            else {
                console.warn(`Failed to retrieve data for ${ticker} after ${maxRetries} retries.`);
            }
        }
        return result;
    });
}
exports.getAevo = getAevo;
