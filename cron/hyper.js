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
exports.getHyper = void 0;
function getHyper(tickers) {
    return __awaiter(this, void 0, void 0, function* () {
        const url = "https://api.hyperliquid.xyz/info";
        const headers = { "Content-Type": "application/json" };
        const body = { type: "metaAndAssetCtxs" };
        try {
            const response = yield fetch(url, {
                method: "POST",
                headers,
                body: JSON.stringify(body),
            });
            if (!response.ok) {
                throw new Error(`HTTP error ${response.status}`);
            }
            const data = yield response.json();
            if (Array.isArray(data[0]['universe']) && Array.isArray(data[1]) && data[0]['universe'].length === data[1].length) {
                const filteredData = tickers.reduce((acc, ticker) => {
                    const index = data[0]['universe'].findIndex((item) => item.name === ticker);
                    if (index !== -1) {
                        const associatedData = data[1][index];
                        acc[`${ticker}-USD`] = {
                            fundingRate: associatedData.funding,
                            openInterest: associatedData.openInterest
                        };
                    }
                    return acc;
                }, {});
                // TODO: check if filtered data is {} and throw error instead of returning
                return filteredData;
            }
            else {
                throw new Error('Data structure is not as expected or arrays do not match in length.');
            }
        }
        catch (error) {
            console.error("Error:", error);
            return {}; // Return an empty object or handle the error as needed
        }
    });
}
exports.getHyper = getHyper;
