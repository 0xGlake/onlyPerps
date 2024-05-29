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
exports.handler = exports.aggregate = void 0;
const aevo_1 = require("./aevo");
const rabbit_1 = require("./rabbit");
const dydx_1 = require("./dydx");
const hyper_1 = require("./hyper");
const vertex_1 = require("./vertex");
const drift_1 = require("./drift");
const tokensData_1 = require("./tokensData");
const exchangesData_1 = require("./exchangesData");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const pg_1 = __importDefault(require("pg"));
const { Client } = pg_1.default;
const connectionString = process.env.CONNECTION_STRING;
const client = new Client({
    connectionString,
});
function aggregate() {
    return __awaiter(this, void 0, void 0, function* () {
        const promises = [
            (0, aevo_1.getAevo)(['ETH', 'BTC', 'SOL']).catch(err => {
                console.error('Error fetching data from Aevo:', err);
                return null;
            }),
            (0, rabbit_1.getRabbitX)(['ETH', 'BTC', 'SOL']).catch(err => {
                console.error('Error fetching data from RabbitX:', err);
                return null;
            }),
            (0, dydx_1.getDyDx)(['ETH', 'BTC', 'SOL']).catch(err => {
                console.error('Error fetching data from DyDx:', err);
                return null;
            }),
            (0, hyper_1.getHyper)(['ETH', 'BTC', 'SOL']).catch(err => {
                console.error('Error fetching data from Hyper:', err);
                return null;
            }),
            (0, vertex_1.getVertex)(['ETH', 'BTC', 'SOL']).catch(err => {
                console.error('Error fetching data from Vertex:', err);
                return null;
            }),
            (0, drift_1.getDrift)(['ETH', 'BTC', 'SOL']).catch(err => {
                console.error('Error fetching data from Drift:', err);
                return null;
            })
        ];
        const [dataAevo, dataRabbitx, dataDyDx, dataHyper, dataVertex, dataDrift] = yield Promise.all(promises);
        return { dataAevo, dataRabbitx, dataDyDx, dataHyper, dataVertex, dataDrift };
    });
}
exports.aggregate = aggregate;
function storeData(data) {
    return __awaiter(this, void 0, void 0, function* () {
        const { dataAevo, dataRabbitx, dataDyDx, dataHyper, dataVertex, dataDrift } = data;
        const query = `
    INSERT INTO onlyperps (aevo_data, rabbitx_data, dydx_data, hyper_data, vertex_data, drift_data)
    VALUES ($1, $2, $3, $4, $5, $6)
  `;
        const values = [
            dataAevo ? JSON.stringify(dataAevo) : null,
            dataRabbitx ? JSON.stringify(dataRabbitx) : null,
            dataDyDx ? JSON.stringify(dataDyDx) : null,
            dataHyper ? JSON.stringify(dataHyper) : null,
            dataVertex ? JSON.stringify(dataVertex) : null,
            dataDrift ? JSON.stringify(dataDrift) : null
        ];
        try {
            // Specifying the generic types here can help TypeScript infer the right overload
            yield client.query(query, values); // LOOK AT THIS LINE IF FUCKED ERROR
        }
        catch (err) {
            console.error('Error storing data:', err);
        }
    });
}
function storeTokenData(data) {
    return __awaiter(this, void 0, void 0, function* () {
        const query = `
    INSERT INTO onlyperpstokens (data)
    VALUES ($1)
  `;
        const tokenData = {};
        for (const [tokenId, coinData] of Object.entries(data)) {
            tokenData[tokenId] = {
                current_price: coinData.current_price,
                fully_diluted_valuation: coinData.fully_diluted_valuation,
                market_cap: coinData.market_cap,
            };
        }
        const values = [JSON.stringify(tokenData)];
        try {
            yield client.query(query, values);
        }
        catch (err) {
            console.error('Error storing token data:', err);
        }
    });
}
function storeExchangeData(data) {
    return __awaiter(this, void 0, void 0, function* () {
        const query = `
    INSERT INTO onlyperpsexchanges (data)
    VALUES ($1)
  `;
        const exchangeData = {};
        for (const [exchangeId, exchangeDatum] of data.entries()) {
            exchangeData[exchangeId] = {
                open_interest_usd: exchangeDatum.open_interest_usd,
                trade_volume_24h_usd: exchangeDatum.trade_volume_24h_usd,
            };
        }
        const values = [JSON.stringify(exchangeData)];
        try {
            yield client.query(query, values);
        }
        catch (err) {
            console.error('Error storing broader exchange data:', err);
        }
    });
}
function handler(event, context) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            yield client.connect();
            console.log('Connected to database');
            const [data, tokenData, exchangeData] = yield Promise.all([
                aggregate(),
                (0, tokensData_1.fetchCoinData)(['aevo-exchange', 'rabbitx', 'dydx-chain', 'vertex-protocol', 'drift-protocol', 'jupiter-exchange-solana', 'gmx']).catch(err => {
                    console.error('Error fetching token data:', err);
                    return {};
                }),
                (0, exchangesData_1.fetchExchangeData)(['aevo', 'vertex_protocol_derivatives', 'drift_protocol', 'hyperliquid', 'rabbitx', 'dydx_perpetual']),
            ]);
            yield Promise.all([
                storeData(data),
                storeTokenData(tokenData),
                storeExchangeData(exchangeData),
            ]);
            console.log('Data stored succesfully');
        }
        catch (err) {
            console.error('Error:', err);
        }
        finally {
            try {
                yield client.end();
                console.log('Connection to PostgreSQL closed.');
            }
            catch (err) {
                console.error('Error closing connection:', err);
            }
        }
    });
}
exports.handler = handler;
// example usage
// handler(null, null);
