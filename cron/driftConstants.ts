import { LAMPORTS_PER_SOL } from '@solana/web3.js';
import { BN } from '@coral-xyz/anchor';
import { PublicKey } from '@solana/web3.js';

export const ZERO = new BN(0);
export const ONE = new BN(1);
export const TWO = new BN(2);
export const THREE = new BN(3);
export const FOUR = new BN(4);
export const FIVE = new BN(5);
export const SIX = new BN(6);
export const SEVEN = new BN(7);
export const EIGHT = new BN(8);
export const NINE = new BN(9);
export const TEN = new BN(10);
export const TEN_THOUSAND = new BN(10000);
export const BN_MAX = new BN(Number.MAX_SAFE_INTEGER);
export const TEN_MILLION = TEN_THOUSAND.mul(TEN_THOUSAND);

export const MAX_LEVERAGE = new BN(5);
export const MAX_LEVERAGE_ORDER_SIZE = new BN('18446744073709551615');

export const PERCENTAGE_PRECISION_EXP = new BN(6);
export const PERCENTAGE_PRECISION = new BN(10).pow(PERCENTAGE_PRECISION_EXP);
export const CONCENTRATION_PRECISION = PERCENTAGE_PRECISION;

export const QUOTE_PRECISION_EXP = new BN(6);
export const FUNDING_RATE_BUFFER_PRECISION_EXP = new BN(3);
export const PRICE_PRECISION_EXP = new BN(6);
export const FUNDING_RATE_PRECISION_EXP = PRICE_PRECISION_EXP.add(
	FUNDING_RATE_BUFFER_PRECISION_EXP
);
export const PEG_PRECISION_EXP = new BN(6);
export const AMM_RESERVE_PRECISION_EXP = new BN(9);

export const SPOT_MARKET_RATE_PRECISION_EXP = new BN(6);
export const SPOT_MARKET_RATE_PRECISION = new BN(10).pow(
	SPOT_MARKET_RATE_PRECISION_EXP
);

export const SPOT_MARKET_CUMULATIVE_INTEREST_PRECISION_EXP = new BN(10);
export const SPOT_MARKET_CUMULATIVE_INTEREST_PRECISION = new BN(10).pow(
	SPOT_MARKET_CUMULATIVE_INTEREST_PRECISION_EXP
);

export const SPOT_MARKET_UTILIZATION_PRECISION_EXP = new BN(6);
export const SPOT_MARKET_UTILIZATION_PRECISION = new BN(10).pow(
	SPOT_MARKET_UTILIZATION_PRECISION_EXP
);

export const SPOT_MARKET_WEIGHT_PRECISION = new BN(10000);
export const SPOT_MARKET_BALANCE_PRECISION_EXP = new BN(9);
export const SPOT_MARKET_BALANCE_PRECISION = new BN(10).pow(
	SPOT_MARKET_BALANCE_PRECISION_EXP
);
export const SPOT_MARKET_IMF_PRECISION_EXP = new BN(6);

export const SPOT_MARKET_IMF_PRECISION = new BN(10).pow(
	SPOT_MARKET_IMF_PRECISION_EXP
);
export const LIQUIDATION_FEE_PRECISION = new BN(1000000);

export const QUOTE_PRECISION = new BN(10).pow(QUOTE_PRECISION_EXP);
export const PRICE_PRECISION = new BN(10).pow(PRICE_PRECISION_EXP);
export const FUNDING_RATE_PRECISION = new BN(10).pow(
	FUNDING_RATE_PRECISION_EXP
);
export const FUNDING_RATE_BUFFER_PRECISION = new BN(10).pow(
	FUNDING_RATE_BUFFER_PRECISION_EXP
);
export const PEG_PRECISION = new BN(10).pow(PEG_PRECISION_EXP);

export const AMM_RESERVE_PRECISION = new BN(10).pow(AMM_RESERVE_PRECISION_EXP);

export const BASE_PRECISION = AMM_RESERVE_PRECISION;
export const BASE_PRECISION_EXP = AMM_RESERVE_PRECISION_EXP;

export const AMM_TO_QUOTE_PRECISION_RATIO =
	AMM_RESERVE_PRECISION.div(QUOTE_PRECISION); // 10^3
export const PRICE_DIV_PEG = PRICE_PRECISION.div(PEG_PRECISION); //10^1
export const PRICE_TO_QUOTE_PRECISION = PRICE_PRECISION.div(QUOTE_PRECISION); // 10^1
export const AMM_TIMES_PEG_TO_QUOTE_PRECISION_RATIO =
	AMM_RESERVE_PRECISION.mul(PEG_PRECISION).div(QUOTE_PRECISION); // 10^9
export const MARGIN_PRECISION = TEN_THOUSAND;
export const BID_ASK_SPREAD_PRECISION = new BN(1000000); // 10^6
export const LIQUIDATION_PCT_PRECISION = TEN_THOUSAND;
export const FUNDING_RATE_OFFSET_DENOMINATOR = new BN(5000);

export const FIVE_MINUTE = new BN(60 * 5);
export const ONE_HOUR = new BN(60 * 60);
export const ONE_YEAR = new BN(31536000);

export const QUOTE_SPOT_MARKET_INDEX = 0;

export const LAMPORTS_PRECISION = new BN(LAMPORTS_PER_SOL);
export const LAMPORTS_EXP = new BN(Math.log10(LAMPORTS_PER_SOL));

export const OPEN_ORDER_MARGIN_REQUIREMENT = QUOTE_PRECISION.div(new BN(100));

export const DEFAULT_REVENUE_SINCE_LAST_FUNDING_SPREAD_RETREAT = new BN(
	-25
).mul(QUOTE_PRECISION);

export const ACCOUNT_AGE_DELETION_CUTOFF_SECONDS = 60 * 60 * 24 * 13; // 13 days
export const IDLE_TIME_SLOTS = 9000;
export const SLOT_TIME_ESTIMATE_MS = 400;

export const DUST_POSITION_SIZE = QUOTE_PRECISION.divn(100); // Dust position is any position smaller than 1c

export type OraclePriceData = {
	price: BN;
	slot: BN;
	confidence: BN;
	hasSufficientNumberOfDataPoints: boolean;
	twap?: BN;
	twapConfidence?: BN;
	maxPrice?: BN; // pre-launch markets only
};

export class OracleSource {
	static readonly PYTH = { pyth: {} };
	static readonly PYTH_1K = { pyth1K: {} };
	static readonly PYTH_1M = { pyth1M: {} };
	static readonly SWITCHBOARD = { switchboard: {} };
	static readonly QUOTE_ASSET = { quoteAsset: {} };
	static readonly PYTH_STABLE_COIN = { pythStableCoin: {} };
	static readonly Prelaunch = { prelaunch: {} };
}

export type PerpMarketConfig = {
	fullName?: string;
	category?: string[];
	symbol: string;
	baseAssetSymbol: string;
	marketIndex: number;
	launchTs: number;
	oracle: PublicKey;
	oracleSource: OracleSource;
};

export const MainnetPerpMarkets: Record<string, PerpMarketConfig> = {
  SOL: {
    fullName: 'Solana',
    category: ['L1', 'Infra', 'Solana'],
    symbol: 'SOL-PERP',
    baseAssetSymbol: 'SOL',
    marketIndex: 0,
    oracle: new PublicKey('H6ARHf6YXhGYeQfUzQNGk6rDNnLBQKrenN712K4AQJEG'),
    launchTs: 1667560505000,
    oracleSource: OracleSource.PYTH,
  },
  BTC: {
    fullName: 'Bitcoin',
    category: ['L1', 'Payment'],
    symbol: 'BTC-PERP',
    baseAssetSymbol: 'BTC',
    marketIndex: 1,
    oracle: new PublicKey('GVXRSBjFk6e6J3NbVPXohDJetcTjaeeuykUpbQF8UoMU'),
    launchTs: 1670347281000,
    oracleSource: OracleSource.PYTH,
  },
  ETH: {
    fullName: 'Ethereum',
    category: ['L1', 'Infra'],
    symbol: 'ETH-PERP',
    baseAssetSymbol: 'ETH',
    marketIndex: 2,
    oracle: new PublicKey('JBu1AL4obBcCMqKBBxhpWCNUt136ijcuMZLFvTP7iWdB'),
    launchTs: 1670347281000,
    oracleSource: OracleSource.PYTH,
  },
  APT: {
    fullName: 'Aptos',
    category: ['L1', 'Infra'],
    symbol: 'APT-PERP',
    baseAssetSymbol: 'APT',
    marketIndex: 3,
    oracle: new PublicKey('FNNvb1AFDnDVPkocEri8mWbJ1952HQZtFLuwPiUjSJQ'),
    launchTs: 1675802661000,
    oracleSource: OracleSource.PYTH,
  },
  '1MBONK': {
    fullName: 'Bonk',
    category: ['Meme', 'Solana'],
    symbol: '1MBONK-PERP',
    baseAssetSymbol: '1MBONK',
    marketIndex: 4,
    oracle: new PublicKey('8ihFLu5FimgTQ1Unh4dVyEHUGodJ5gJQCrQf4KUVB9bN'),
    launchTs: 1677690149000,
    oracleSource: OracleSource.PYTH_1M,
  },
  MATIC: {
    fullName: 'Polygon',
    category: ['L2', 'Infra'],
    symbol: 'MATIC-PERP',
    baseAssetSymbol: 'MATIC',
    marketIndex: 5,
    oracle: new PublicKey('7KVswB9vkCgeM3SHP7aGDijvdRAHK8P5wi9JXViCrtYh'),
    launchTs: 1677690149000,
    oracleSource: OracleSource.PYTH,
  },
  ARB: {
    fullName: 'Arbitrum',
    category: ['L2', 'Infra'],
    symbol: 'ARB-PERP',
    baseAssetSymbol: 'ARB',
    marketIndex: 6,
    oracle: new PublicKey('5HRrdmghsnU3i2u5StaKaydS7eq3vnKVKwXMzCNKsc4C'),
    launchTs: 1679501812000,
    oracleSource: OracleSource.PYTH,
  },
  DOGE: {
    fullName: 'Doge',
    category: ['Meme', 'Dog'],
    symbol: 'DOGE-PERP',
    baseAssetSymbol: 'DOGE',
    marketIndex: 7,
    oracle: new PublicKey('FsSM3s38PX9K7Dn6eGzuE29S2Dsk1Sss1baytTQdCaQj'),
    launchTs: 1680808053000,
    oracleSource: OracleSource.PYTH,
  },
  BNB: {
    fullName: 'Binance Coin',
    category: ['Exchange'],
    symbol: 'BNB-PERP',
    baseAssetSymbol: 'BNB',
    marketIndex: 8,
    oracle: new PublicKey('4CkQJBxhU8EZ2UjhigbtdaPbpTe6mqf811fipYBFbSYN'),
    launchTs: 1680808053000,
    oracleSource: OracleSource.PYTH,
  },
  SUI: {
    fullName: 'Sui',
    category: ['L1'],
    symbol: 'SUI-PERP',
    baseAssetSymbol: 'SUI',
    marketIndex: 9,
    oracle: new PublicKey('3Qub3HaAJaa2xNY7SUqPKd3vVwTqDfDDkEUMPjXD2c1q'),
    launchTs: 1683125906000,
    oracleSource: OracleSource.PYTH,
  },
  '1MPEPE': {
    fullName: 'Pepe',
    category: ['Meme'],
    symbol: '1MPEPE-PERP',
    baseAssetSymbol: '1MPEPE',
    marketIndex: 10,
    oracle: new PublicKey('FSfxunDmjjbDV2QxpyxFCAPKmYJHSLnLuvQXDLkMzLBm'),
    launchTs: 1683781239000,
    oracleSource: OracleSource.PYTH_1M,
  },
  OP: {
    fullName: 'OP',
    category: ['L2', 'Infra'],
    symbol: 'OP-PERP',
    baseAssetSymbol: 'OP',
    marketIndex: 11,
    oracle: new PublicKey('4o4CUwzFwLqCvmA5x1G4VzoZkAhAcbiuiYyjWX1CVbY2'),
    launchTs: 1686091480000,
    oracleSource: OracleSource.PYTH,
  },
  RNDR: {
    fullName: 'RNDR',
    category: ['Infra', 'Solana'],
    symbol: 'RNDR-PERP',
    baseAssetSymbol: 'RNDR',
    marketIndex: 12,
    oracle: new PublicKey('CYGfrBJB9HgLf9iZyN4aH5HvUAi2htQ4MjPxeXMf4Egn'),
    launchTs: 1687201081000,
    oracleSource: OracleSource.PYTH,
  },
  XRP: {
    fullName: 'XRP',
    category: ['Payments'],
    symbol: 'XRP-PERP',
    baseAssetSymbol: 'XRP',
    marketIndex: 13,
    oracle: new PublicKey('Guffb8DAAxNH6kdoawYjPXTbwUhjmveh8R4LM6uEqRV1'),
    launchTs: 1689270550000,
    oracleSource: OracleSource.PYTH,
  },
  HNT: {
    fullName: 'HNT',
    category: ['IoT', 'Solana'],
    symbol: 'HNT-PERP',
    baseAssetSymbol: 'HNT',
    marketIndex: 14,
    oracle: new PublicKey('7moA1i5vQUpfDwSpK6Pw9s56ahB7WFGidtbL2ujWrVvm'),
    launchTs: 1692294955000,
    oracleSource: OracleSource.PYTH,
  },
  INJ: {
    fullName: 'INJ',
    category: ['L1', 'Exchange'],
    symbol: 'INJ-PERP',
    baseAssetSymbol: 'INJ',
    marketIndex: 15,
    oracle: new PublicKey('9EdtbaivHQYA4Nh3XzGR6DwRaoorqXYnmpfsnFhvwuVj'),
    launchTs: 1698074659000,
    oracleSource: OracleSource.PYTH,
  },
  LINK: {
    fullName: 'LINK',
    category: ['Oracle'],
    symbol: 'LINK-PERP',
    baseAssetSymbol: 'LINK',
    marketIndex: 16,
    oracle: new PublicKey('ALdkqQDMfHNg77oCNskfX751kHys4KE7SFuZzuKaN536'),
    launchTs: 1698074659000,
    oracleSource: OracleSource.PYTH,
  },
  RLB: {
    fullName: 'Rollbit',
    category: ['Exchange'],
    symbol: 'RLB-PERP',
    baseAssetSymbol: 'RLB',
    marketIndex: 17,
    oracle: new PublicKey('4BA3RcS4zE32WWgp49vvvre2t6nXY1W1kMyKZxeeuUey'),
    launchTs: 1699265968000,
    oracleSource: OracleSource.PYTH,
  },
  PYTH: {
    fullName: 'Pyth',
    category: ['Oracle', 'Solana'],
    symbol: 'PYTH-PERP',
    baseAssetSymbol: 'PYTH',
    marketIndex: 18,
    oracle: new PublicKey('nrYkQQQur7z8rYTST3G9GqATviK5SxTDkrqd21MW6Ue'),
    launchTs: 1700542800000,
    oracleSource: OracleSource.PYTH,
  },
  TIA: {
    fullName: 'Celestia',
    category: ['Data'],
    symbol: 'TIA-PERP',
    baseAssetSymbol: 'TIA',
    marketIndex: 19,
    oracle: new PublicKey('funeUsHgi2QKkLdUPASRLuYkaK8JaazCEz3HikbkhVt'),
    launchTs: 1701880540000,
    oracleSource: OracleSource.PYTH,
  },
  JTO: {
    fullName: 'Jito',
    category: ['MEV', 'Solana'],
    symbol: 'JTO-PERP',
    baseAssetSymbol: 'JTO',
    marketIndex: 20,
    oracle: new PublicKey('D8UUgr8a3aR3yUeHLu7v8FWK7E8Y5sSU7qrYBXUJXBQ5'),
    launchTs: 1701967240000,
    oracleSource: OracleSource.PYTH,
  },
  SEI: {
    fullName: 'SEI',
    category: ['L1'],
    symbol: 'SEI-PERP',
    baseAssetSymbol: 'SEI',
    marketIndex: 21,
    oracle: new PublicKey('6cUuAyAX3eXoiWkjFF77RQBEUF15AAMQ7d1hm4EPd3tv'),
    launchTs: 1703173331000,
    oracleSource: OracleSource.PYTH,
  },
  AVAX: {
    fullName: 'AVAX',
    category: ['Rollup', 'Infra'],
    symbol: 'AVAX-PERP',
    baseAssetSymbol: 'AVAX',
    marketIndex: 22,
    oracle: new PublicKey('Ax9ujW5B9oqcv59N8m6f1BpTBq2rGeGaBcpKjC5UYsXU'),
    launchTs: 1704209558000,
    oracleSource: OracleSource.PYTH,
  },
  WIF: {
    fullName: 'WIF',
    category: ['Meme', 'Dog', 'Solana'],
    symbol: 'WIF-PERP',
    baseAssetSymbol: 'WIF',
    marketIndex: 23,
    oracle: new PublicKey('6ABgrEZk8urs6kJ1JNdC1sspH5zKXRqxy8sg3ZG2cQps'),
    launchTs: 1706219971000,
    oracleSource: OracleSource.PYTH,
  },
  JUP: {
    fullName: 'JUP',
    category: ['Exchange', 'Infra', 'Solana'],
    symbol: 'JUP-PERP',
    baseAssetSymbol: 'JUP',
    marketIndex: 24,
    oracle: new PublicKey('g6eRCbboSwK4tSWngn773RCMexr1APQr4uA9bGZBYfo'),
    launchTs: 1706713201000,
    oracleSource: OracleSource.PYTH,
  },
  DYM: {
    fullName: 'Dymension',
    category: ['Rollup', 'Infra'],
    symbol: 'DYM-PERP',
    baseAssetSymbol: 'DYM',
    marketIndex: 25,
    oracle: new PublicKey('CSRRrhXa6DYu1W5jf89A7unCATdug2Z33tYyV2NXZZxa'),
    launchTs: 1708448765000,
    oracleSource: OracleSource.PYTH,
  },
  TAO: {
    fullName: 'BITTENSOR',
    category: ['AI', 'Infra'],
    symbol: 'TAO-PERP',
    baseAssetSymbol: 'TAO',
    marketIndex: 26,
    oracle: new PublicKey('5NxzemFgGDhimYE3S5qmb5zkjZUmiHXb4up5WGXe7NLn'),
    launchTs: 1709136669000,
    oracleSource: OracleSource.PYTH,
  },
	W: {
		fullName: 'Wormhole',
		category: ['Bridge'],
		symbol: 'W-PERP',
		baseAssetSymbol: 'W',
		marketIndex: 27,
		oracle: new PublicKey('H9j8CT1bFiWHaZUPMooEaxMRHdWdJ5T9CzFn41z96JHW'),
		launchTs: 1710418343000,
		oracleSource: OracleSource.PYTH,
	},
	KMNO: {
		fullName: 'Kamino',
		category: ['Lending', 'Solana'],
		symbol: 'KMNO-PERP',
		baseAssetSymbol: 'KMNO',
		marketIndex: 28,
		oracle: new PublicKey('sDAQaZQJQ4RXAxH3x526mbEXyQZT15ktkL84d7hmk7M'),
		launchTs: 1712240681000,
		oracleSource: OracleSource.Prelaunch,
	},
	TNSR: {
		fullName: 'Tensor',
		category: ['NFT', 'Solana'],
		symbol: 'TNSR-PERP',
		baseAssetSymbol: 'TNSR',
		marketIndex: 29,
		oracle: new PublicKey('7Cfyymx49ipGsgEsCA2XygAB2DUsan4C6Cyb5c8oR5st'),
		launchTs: 1712593532000,
		oracleSource: OracleSource.SWITCHBOARD,
	}
}