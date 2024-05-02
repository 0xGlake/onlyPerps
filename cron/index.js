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
function handler(event, context) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            yield client.connect();
            console.log('Connected to database');
            const data = yield aggregate();
            yield storeData(data);
            console.log('Data stored in the onlyperps table');
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
