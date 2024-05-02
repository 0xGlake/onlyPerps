import { Connection } from '@solana/web3.js';
import dotenv from 'dotenv';
dotenv.config();

let rpcConnection: Connection | null = null;

export async function getRpcConnection(): Promise<Connection> {
  if (rpcConnection) {
    return rpcConnection;
  }

	// Set up the Connection
	const rpcAddress = process.env.RPC_ADDRESS; // can use: https://api.devnet.solana.com for devnet; https://api.mainnet-beta.solana.com for mainnet;
  if (!rpcAddress) {
    throw new Error('RPC_ADDRESS environment variable is not set');
  }
  rpcConnection = await new Connection(rpcAddress);
  return rpcConnection;
};
