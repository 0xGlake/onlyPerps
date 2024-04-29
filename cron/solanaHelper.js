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
exports.getRpcConnection = void 0;
const web3_js_1 = require("@solana/web3.js");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
let rpcConnection = null;
function getRpcConnection() {
    return __awaiter(this, void 0, void 0, function* () {
        if (rpcConnection) {
            return rpcConnection;
        }
        // Set up the Connection
        const rpcAddress = process.env.RPC_ADDRESS; // can use: https://api.devnet.solana.com for devnet; https://api.mainnet-beta.solana.com for mainnet;
        if (!rpcAddress) {
            throw new Error('RPC_ADDRESS environment variable is not set');
        }
        rpcConnection = yield new web3_js_1.Connection(rpcAddress);
        console.log('Connected to RPC:', rpcAddress);
        //console.log('RPC connection:', rpcConnection);
        return rpcConnection;
    });
}
exports.getRpcConnection = getRpcConnection;
;
