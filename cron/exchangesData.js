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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetchExchangeData = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
function fetchExchangeData(exchangeIds) {
    return __awaiter(this, void 0, void 0, function* () {
        const COIN_GECKO = process.env.COIN_GECKO;
        if (!COIN_GECKO) {
            console.error('API key is not defined. Please set COIN_GECKO in your environment variables.');
            process.exit(1);
        }
        const exchangesUrl = `https://api.coingecko.com/api/v3/derivatives/exchanges`;
        const bitcoinPriceUrl = 'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd&include_market_cap=false&include_24hr_vol=false&include_24hr_change=false&include_last_updated_at=false';
        const options = {
            method: 'GET',
            headers: { accept: 'application/json', 'x-cg-demo-api-key': COIN_GECKO },
        };
        try {
            // Fetch the Bitcoin price
            const bitcoinPriceResponse = yield fetch(bitcoinPriceUrl, options);
            const bitcoinPriceData = yield bitcoinPriceResponse.json();
            const bitcoinPrice = bitcoinPriceData.bitcoin.usd;
            // Fetch the exchange data
            const exchangeResponse = yield fetch(exchangesUrl, options);
            const exchangeData = yield exchangeResponse.json();
            const exchangeMap = new Map();
            // Filter and store the exchanges in the map
            exchangeData
                .filter((exchange) => exchangeIds.includes(exchange.id))
                .forEach((exchange) => {
                // Convert open interest and trade volume to USD basis
                const openInterestUSD = exchange.open_interest_btc * bitcoinPrice;
                const tradeVolumeUSD = exchange.trade_volume_24h_btc * bitcoinPrice;
                // Update the exchange object with USD values
                const updatedExchange = Object.assign(Object.assign({}, exchange), { open_interest_usd: openInterestUSD, trade_volume_24h_usd: tradeVolumeUSD });
                exchangeMap.set(exchange.id, updatedExchange);
            });
            return exchangeMap;
        }
        catch (error) {
            console.error('Error fetching data:', error);
            throw error;
        }
    });
}
exports.fetchExchangeData = fetchExchangeData;
// Example example usage
// fetchExchangeData(['aevo', 'vertex_protocol_derivatives', 'drift_protocol', 'hyperliquid', 'rabbitx', 'dydx_perpetual']);
