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
exports.getRabbitX = void 0;
function getRabbitX(tickers) {
    return __awaiter(this, void 0, void 0, function* () {
        const response = yield fetch(`https://api.prod.rabbitx.io/markets`, {
            headers: {
                'Content-Type': 'application/json'
            }
        });
        if (!response.ok) {
            throw new Error(`HTTP error ${response.status}`);
        }
        const jsonResponse = yield response.json();
        if (!jsonResponse.success) {
            throw new Error('API response was not successful');
        }
        const marketsData = jsonResponse.result;
        // Accumulate filtered markets data using reduce, similar to your reference implementation
        const filteredMarkets = tickers.reduce((acc, ticker) => {
            const marketKey = `${ticker}-USD`;
            const market = marketsData.find((m) => m.id === marketKey);
            if (market) {
                acc[marketKey] = {
                    fundingRate: market.instant_funding_rate,
                    openInterest: (market.open_interest / market.index_price).toString()
                };
            }
            return acc;
        }, {});
        return filteredMarkets;
    });
}
exports.getRabbitX = getRabbitX;
