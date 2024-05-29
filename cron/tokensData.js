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
exports.fetchCoinData = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const COIN_GECKO = process.env.COIN_GECKO;
if (!COIN_GECKO) {
    console.error('API key is not defined. Please set COIN_GECKO in your environment variables.');
}
function createCoinDataMap(data) {
    return data.reduce((map, coin) => {
        map[coin.id] = coin;
        return map;
    }, {});
}
function fetchCoinData(coinIds) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!COIN_GECKO) {
            return Promise.reject('API key is not defined. Please set COIN_GECKO in your environment variables.');
        }
        const idsParam = coinIds.join('%2C');
        const url = `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=${idsParam}`;
        const options = {
            method: 'GET',
            headers: { accept: 'application/json', 'x-cg-demo-api-key': COIN_GECKO },
        };
        return fetch(url, options)
            .then(res => res.json())
            .then(json => createCoinDataMap(json))
            .catch(err => {
            console.error('error:' + err);
            throw err;
        });
    });
}
exports.fetchCoinData = fetchCoinData;
// Example usage
//const coins = ['aevo-exchange', 'rabbitx', 'dydx-chain', 'vertex-protocol', 'drift-protocol', 'jupiter-exchange-solana', 'gmx'];
