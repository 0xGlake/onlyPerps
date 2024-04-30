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
exports.getVertex = void 0;
function getVertex(tickers) {
    return __awaiter(this, void 0, void 0, function* () {
        const url = 'https://archive.prod.vertexprotocol.com/v2/contracts';
        const response = yield fetch(url, {
            headers: {
                'accept': 'application/json',
            },
        });
        if (!response.ok) {
            throw new Error(`HTTP error ${response.status}`);
        }
        const data = yield response.json();
        const result = {};
        for (const ticker of tickers) {
            const tickerKey = `${ticker}-PERP_USDC`;
            if (data[tickerKey]) {
                result[`${ticker}-USD`] = {
                    fundingRate: parseFloat(data[tickerKey].funding_rate.toString()).toFixed(18).toString(),
                    openInterest: data[tickerKey].open_interest.toString(),
                };
            }
        }
        return result;
    });
}
exports.getVertex = getVertex;
