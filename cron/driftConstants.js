"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MARGIN_PRECISION = exports.AMM_TIMES_PEG_TO_QUOTE_PRECISION_RATIO = exports.PRICE_TO_QUOTE_PRECISION = exports.PRICE_DIV_PEG = exports.AMM_TO_QUOTE_PRECISION_RATIO = exports.BASE_PRECISION_EXP = exports.BASE_PRECISION = exports.AMM_RESERVE_PRECISION = exports.PEG_PRECISION = exports.FUNDING_RATE_BUFFER_PRECISION = exports.FUNDING_RATE_PRECISION = exports.PRICE_PRECISION = exports.QUOTE_PRECISION = exports.LIQUIDATION_FEE_PRECISION = exports.SPOT_MARKET_IMF_PRECISION = exports.SPOT_MARKET_IMF_PRECISION_EXP = exports.SPOT_MARKET_BALANCE_PRECISION = exports.SPOT_MARKET_BALANCE_PRECISION_EXP = exports.SPOT_MARKET_WEIGHT_PRECISION = exports.SPOT_MARKET_UTILIZATION_PRECISION = exports.SPOT_MARKET_UTILIZATION_PRECISION_EXP = exports.SPOT_MARKET_CUMULATIVE_INTEREST_PRECISION = exports.SPOT_MARKET_CUMULATIVE_INTEREST_PRECISION_EXP = exports.SPOT_MARKET_RATE_PRECISION = exports.SPOT_MARKET_RATE_PRECISION_EXP = exports.AMM_RESERVE_PRECISION_EXP = exports.PEG_PRECISION_EXP = exports.FUNDING_RATE_PRECISION_EXP = exports.PRICE_PRECISION_EXP = exports.FUNDING_RATE_BUFFER_PRECISION_EXP = exports.QUOTE_PRECISION_EXP = exports.CONCENTRATION_PRECISION = exports.PERCENTAGE_PRECISION = exports.PERCENTAGE_PRECISION_EXP = exports.MAX_LEVERAGE_ORDER_SIZE = exports.MAX_LEVERAGE = exports.TEN_MILLION = exports.BN_MAX = exports.TEN_THOUSAND = exports.TEN = exports.NINE = exports.EIGHT = exports.SEVEN = exports.SIX = exports.FIVE = exports.FOUR = exports.THREE = exports.TWO = exports.ONE = exports.ZERO = void 0;
exports.MainnetPerpMarkets = exports.OracleSource = exports.DUST_POSITION_SIZE = exports.SLOT_TIME_ESTIMATE_MS = exports.IDLE_TIME_SLOTS = exports.ACCOUNT_AGE_DELETION_CUTOFF_SECONDS = exports.DEFAULT_REVENUE_SINCE_LAST_FUNDING_SPREAD_RETREAT = exports.OPEN_ORDER_MARGIN_REQUIREMENT = exports.LAMPORTS_EXP = exports.LAMPORTS_PRECISION = exports.QUOTE_SPOT_MARKET_INDEX = exports.ONE_YEAR = exports.ONE_HOUR = exports.FIVE_MINUTE = exports.FUNDING_RATE_OFFSET_DENOMINATOR = exports.LIQUIDATION_PCT_PRECISION = exports.BID_ASK_SPREAD_PRECISION = void 0;
const web3_js_1 = require("@solana/web3.js");
const anchor_1 = require("@coral-xyz/anchor");
const web3_js_2 = require("@solana/web3.js");
exports.ZERO = new anchor_1.BN(0);
exports.ONE = new anchor_1.BN(1);
exports.TWO = new anchor_1.BN(2);
exports.THREE = new anchor_1.BN(3);
exports.FOUR = new anchor_1.BN(4);
exports.FIVE = new anchor_1.BN(5);
exports.SIX = new anchor_1.BN(6);
exports.SEVEN = new anchor_1.BN(7);
exports.EIGHT = new anchor_1.BN(8);
exports.NINE = new anchor_1.BN(9);
exports.TEN = new anchor_1.BN(10);
exports.TEN_THOUSAND = new anchor_1.BN(10000);
exports.BN_MAX = new anchor_1.BN(Number.MAX_SAFE_INTEGER);
exports.TEN_MILLION = exports.TEN_THOUSAND.mul(exports.TEN_THOUSAND);
exports.MAX_LEVERAGE = new anchor_1.BN(5);
exports.MAX_LEVERAGE_ORDER_SIZE = new anchor_1.BN('18446744073709551615');
exports.PERCENTAGE_PRECISION_EXP = new anchor_1.BN(6);
exports.PERCENTAGE_PRECISION = new anchor_1.BN(10).pow(exports.PERCENTAGE_PRECISION_EXP);
exports.CONCENTRATION_PRECISION = exports.PERCENTAGE_PRECISION;
exports.QUOTE_PRECISION_EXP = new anchor_1.BN(6);
exports.FUNDING_RATE_BUFFER_PRECISION_EXP = new anchor_1.BN(3);
exports.PRICE_PRECISION_EXP = new anchor_1.BN(6);
exports.FUNDING_RATE_PRECISION_EXP = exports.PRICE_PRECISION_EXP.add(exports.FUNDING_RATE_BUFFER_PRECISION_EXP);
exports.PEG_PRECISION_EXP = new anchor_1.BN(6);
exports.AMM_RESERVE_PRECISION_EXP = new anchor_1.BN(9);
exports.SPOT_MARKET_RATE_PRECISION_EXP = new anchor_1.BN(6);
exports.SPOT_MARKET_RATE_PRECISION = new anchor_1.BN(10).pow(exports.SPOT_MARKET_RATE_PRECISION_EXP);
exports.SPOT_MARKET_CUMULATIVE_INTEREST_PRECISION_EXP = new anchor_1.BN(10);
exports.SPOT_MARKET_CUMULATIVE_INTEREST_PRECISION = new anchor_1.BN(10).pow(exports.SPOT_MARKET_CUMULATIVE_INTEREST_PRECISION_EXP);
exports.SPOT_MARKET_UTILIZATION_PRECISION_EXP = new anchor_1.BN(6);
exports.SPOT_MARKET_UTILIZATION_PRECISION = new anchor_1.BN(10).pow(exports.SPOT_MARKET_UTILIZATION_PRECISION_EXP);
exports.SPOT_MARKET_WEIGHT_PRECISION = new anchor_1.BN(10000);
exports.SPOT_MARKET_BALANCE_PRECISION_EXP = new anchor_1.BN(9);
exports.SPOT_MARKET_BALANCE_PRECISION = new anchor_1.BN(10).pow(exports.SPOT_MARKET_BALANCE_PRECISION_EXP);
exports.SPOT_MARKET_IMF_PRECISION_EXP = new anchor_1.BN(6);
exports.SPOT_MARKET_IMF_PRECISION = new anchor_1.BN(10).pow(exports.SPOT_MARKET_IMF_PRECISION_EXP);
exports.LIQUIDATION_FEE_PRECISION = new anchor_1.BN(1000000);
exports.QUOTE_PRECISION = new anchor_1.BN(10).pow(exports.QUOTE_PRECISION_EXP);
exports.PRICE_PRECISION = new anchor_1.BN(10).pow(exports.PRICE_PRECISION_EXP);
exports.FUNDING_RATE_PRECISION = new anchor_1.BN(10).pow(exports.FUNDING_RATE_PRECISION_EXP);
exports.FUNDING_RATE_BUFFER_PRECISION = new anchor_1.BN(10).pow(exports.FUNDING_RATE_BUFFER_PRECISION_EXP);
exports.PEG_PRECISION = new anchor_1.BN(10).pow(exports.PEG_PRECISION_EXP);
exports.AMM_RESERVE_PRECISION = new anchor_1.BN(10).pow(exports.AMM_RESERVE_PRECISION_EXP);
exports.BASE_PRECISION = exports.AMM_RESERVE_PRECISION;
exports.BASE_PRECISION_EXP = exports.AMM_RESERVE_PRECISION_EXP;
exports.AMM_TO_QUOTE_PRECISION_RATIO = exports.AMM_RESERVE_PRECISION.div(exports.QUOTE_PRECISION); // 10^3
exports.PRICE_DIV_PEG = exports.PRICE_PRECISION.div(exports.PEG_PRECISION); //10^1
exports.PRICE_TO_QUOTE_PRECISION = exports.PRICE_PRECISION.div(exports.QUOTE_PRECISION); // 10^1
exports.AMM_TIMES_PEG_TO_QUOTE_PRECISION_RATIO = exports.AMM_RESERVE_PRECISION.mul(exports.PEG_PRECISION).div(exports.QUOTE_PRECISION); // 10^9
exports.MARGIN_PRECISION = exports.TEN_THOUSAND;
exports.BID_ASK_SPREAD_PRECISION = new anchor_1.BN(1000000); // 10^6
exports.LIQUIDATION_PCT_PRECISION = exports.TEN_THOUSAND;
exports.FUNDING_RATE_OFFSET_DENOMINATOR = new anchor_1.BN(5000);
exports.FIVE_MINUTE = new anchor_1.BN(60 * 5);
exports.ONE_HOUR = new anchor_1.BN(60 * 60);
exports.ONE_YEAR = new anchor_1.BN(31536000);
exports.QUOTE_SPOT_MARKET_INDEX = 0;
exports.LAMPORTS_PRECISION = new anchor_1.BN(web3_js_1.LAMPORTS_PER_SOL);
exports.LAMPORTS_EXP = new anchor_1.BN(Math.log10(web3_js_1.LAMPORTS_PER_SOL));
exports.OPEN_ORDER_MARGIN_REQUIREMENT = exports.QUOTE_PRECISION.div(new anchor_1.BN(100));
exports.DEFAULT_REVENUE_SINCE_LAST_FUNDING_SPREAD_RETREAT = new anchor_1.BN(-25).mul(exports.QUOTE_PRECISION);
exports.ACCOUNT_AGE_DELETION_CUTOFF_SECONDS = 60 * 60 * 24 * 13; // 13 days
exports.IDLE_TIME_SLOTS = 9000;
exports.SLOT_TIME_ESTIMATE_MS = 400;
exports.DUST_POSITION_SIZE = exports.QUOTE_PRECISION.divn(100); // Dust position is any position smaller than 1c
class OracleSource {
}
exports.OracleSource = OracleSource;
OracleSource.PYTH = { pyth: {} };
OracleSource.PYTH_1K = { pyth1K: {} };
OracleSource.PYTH_1M = { pyth1M: {} };
OracleSource.SWITCHBOARD = { switchboard: {} };
OracleSource.QUOTE_ASSET = { quoteAsset: {} };
OracleSource.PYTH_STABLE_COIN = { pythStableCoin: {} };
OracleSource.Prelaunch = { prelaunch: {} };
exports.MainnetPerpMarkets = {
    SOL: {
        fullName: 'Solana',
        category: ['L1', 'Infra', 'Solana'],
        symbol: 'SOL-PERP',
        baseAssetSymbol: 'SOL',
        marketIndex: 0,
        oracle: new web3_js_2.PublicKey('H6ARHf6YXhGYeQfUzQNGk6rDNnLBQKrenN712K4AQJEG'),
        launchTs: 1667560505000,
        oracleSource: OracleSource.PYTH,
    },
    BTC: {
        fullName: 'Bitcoin',
        category: ['L1', 'Payment'],
        symbol: 'BTC-PERP',
        baseAssetSymbol: 'BTC',
        marketIndex: 1,
        oracle: new web3_js_2.PublicKey('GVXRSBjFk6e6J3NbVPXohDJetcTjaeeuykUpbQF8UoMU'),
        launchTs: 1670347281000,
        oracleSource: OracleSource.PYTH,
    },
    ETH: {
        fullName: 'Ethereum',
        category: ['L1', 'Infra'],
        symbol: 'ETH-PERP',
        baseAssetSymbol: 'ETH',
        marketIndex: 2,
        oracle: new web3_js_2.PublicKey('JBu1AL4obBcCMqKBBxhpWCNUt136ijcuMZLFvTP7iWdB'),
        launchTs: 1670347281000,
        oracleSource: OracleSource.PYTH,
    },
    APT: {
        fullName: 'Aptos',
        category: ['L1', 'Infra'],
        symbol: 'APT-PERP',
        baseAssetSymbol: 'APT',
        marketIndex: 3,
        oracle: new web3_js_2.PublicKey('FNNvb1AFDnDVPkocEri8mWbJ1952HQZtFLuwPiUjSJQ'),
        launchTs: 1675802661000,
        oracleSource: OracleSource.PYTH,
    },
    '1MBONK': {
        fullName: 'Bonk',
        category: ['Meme', 'Solana'],
        symbol: '1MBONK-PERP',
        baseAssetSymbol: '1MBONK',
        marketIndex: 4,
        oracle: new web3_js_2.PublicKey('8ihFLu5FimgTQ1Unh4dVyEHUGodJ5gJQCrQf4KUVB9bN'),
        launchTs: 1677690149000,
        oracleSource: OracleSource.PYTH_1M,
    },
    MATIC: {
        fullName: 'Polygon',
        category: ['L2', 'Infra'],
        symbol: 'MATIC-PERP',
        baseAssetSymbol: 'MATIC',
        marketIndex: 5,
        oracle: new web3_js_2.PublicKey('7KVswB9vkCgeM3SHP7aGDijvdRAHK8P5wi9JXViCrtYh'),
        launchTs: 1677690149000,
        oracleSource: OracleSource.PYTH,
    },
    ARB: {
        fullName: 'Arbitrum',
        category: ['L2', 'Infra'],
        symbol: 'ARB-PERP',
        baseAssetSymbol: 'ARB',
        marketIndex: 6,
        oracle: new web3_js_2.PublicKey('5HRrdmghsnU3i2u5StaKaydS7eq3vnKVKwXMzCNKsc4C'),
        launchTs: 1679501812000,
        oracleSource: OracleSource.PYTH,
    },
    DOGE: {
        fullName: 'Doge',
        category: ['Meme', 'Dog'],
        symbol: 'DOGE-PERP',
        baseAssetSymbol: 'DOGE',
        marketIndex: 7,
        oracle: new web3_js_2.PublicKey('FsSM3s38PX9K7Dn6eGzuE29S2Dsk1Sss1baytTQdCaQj'),
        launchTs: 1680808053000,
        oracleSource: OracleSource.PYTH,
    },
    BNB: {
        fullName: 'Binance Coin',
        category: ['Exchange'],
        symbol: 'BNB-PERP',
        baseAssetSymbol: 'BNB',
        marketIndex: 8,
        oracle: new web3_js_2.PublicKey('4CkQJBxhU8EZ2UjhigbtdaPbpTe6mqf811fipYBFbSYN'),
        launchTs: 1680808053000,
        oracleSource: OracleSource.PYTH,
    },
    SUI: {
        fullName: 'Sui',
        category: ['L1'],
        symbol: 'SUI-PERP',
        baseAssetSymbol: 'SUI',
        marketIndex: 9,
        oracle: new web3_js_2.PublicKey('3Qub3HaAJaa2xNY7SUqPKd3vVwTqDfDDkEUMPjXD2c1q'),
        launchTs: 1683125906000,
        oracleSource: OracleSource.PYTH,
    },
    '1MPEPE': {
        fullName: 'Pepe',
        category: ['Meme'],
        symbol: '1MPEPE-PERP',
        baseAssetSymbol: '1MPEPE',
        marketIndex: 10,
        oracle: new web3_js_2.PublicKey('FSfxunDmjjbDV2QxpyxFCAPKmYJHSLnLuvQXDLkMzLBm'),
        launchTs: 1683781239000,
        oracleSource: OracleSource.PYTH_1M,
    },
    OP: {
        fullName: 'OP',
        category: ['L2', 'Infra'],
        symbol: 'OP-PERP',
        baseAssetSymbol: 'OP',
        marketIndex: 11,
        oracle: new web3_js_2.PublicKey('4o4CUwzFwLqCvmA5x1G4VzoZkAhAcbiuiYyjWX1CVbY2'),
        launchTs: 1686091480000,
        oracleSource: OracleSource.PYTH,
    },
    RNDR: {
        fullName: 'RNDR',
        category: ['Infra', 'Solana'],
        symbol: 'RNDR-PERP',
        baseAssetSymbol: 'RNDR',
        marketIndex: 12,
        oracle: new web3_js_2.PublicKey('CYGfrBJB9HgLf9iZyN4aH5HvUAi2htQ4MjPxeXMf4Egn'),
        launchTs: 1687201081000,
        oracleSource: OracleSource.PYTH,
    },
    XRP: {
        fullName: 'XRP',
        category: ['Payments'],
        symbol: 'XRP-PERP',
        baseAssetSymbol: 'XRP',
        marketIndex: 13,
        oracle: new web3_js_2.PublicKey('Guffb8DAAxNH6kdoawYjPXTbwUhjmveh8R4LM6uEqRV1'),
        launchTs: 1689270550000,
        oracleSource: OracleSource.PYTH,
    },
    HNT: {
        fullName: 'HNT',
        category: ['IoT', 'Solana'],
        symbol: 'HNT-PERP',
        baseAssetSymbol: 'HNT',
        marketIndex: 14,
        oracle: new web3_js_2.PublicKey('7moA1i5vQUpfDwSpK6Pw9s56ahB7WFGidtbL2ujWrVvm'),
        launchTs: 1692294955000,
        oracleSource: OracleSource.PYTH,
    },
    INJ: {
        fullName: 'INJ',
        category: ['L1', 'Exchange'],
        symbol: 'INJ-PERP',
        baseAssetSymbol: 'INJ',
        marketIndex: 15,
        oracle: new web3_js_2.PublicKey('9EdtbaivHQYA4Nh3XzGR6DwRaoorqXYnmpfsnFhvwuVj'),
        launchTs: 1698074659000,
        oracleSource: OracleSource.PYTH,
    },
    LINK: {
        fullName: 'LINK',
        category: ['Oracle'],
        symbol: 'LINK-PERP',
        baseAssetSymbol: 'LINK',
        marketIndex: 16,
        oracle: new web3_js_2.PublicKey('ALdkqQDMfHNg77oCNskfX751kHys4KE7SFuZzuKaN536'),
        launchTs: 1698074659000,
        oracleSource: OracleSource.PYTH,
    },
    RLB: {
        fullName: 'Rollbit',
        category: ['Exchange'],
        symbol: 'RLB-PERP',
        baseAssetSymbol: 'RLB',
        marketIndex: 17,
        oracle: new web3_js_2.PublicKey('4BA3RcS4zE32WWgp49vvvre2t6nXY1W1kMyKZxeeuUey'),
        launchTs: 1699265968000,
        oracleSource: OracleSource.PYTH,
    },
    PYTH: {
        fullName: 'Pyth',
        category: ['Oracle', 'Solana'],
        symbol: 'PYTH-PERP',
        baseAssetSymbol: 'PYTH',
        marketIndex: 18,
        oracle: new web3_js_2.PublicKey('nrYkQQQur7z8rYTST3G9GqATviK5SxTDkrqd21MW6Ue'),
        launchTs: 1700542800000,
        oracleSource: OracleSource.PYTH,
    },
    TIA: {
        fullName: 'Celestia',
        category: ['Data'],
        symbol: 'TIA-PERP',
        baseAssetSymbol: 'TIA',
        marketIndex: 19,
        oracle: new web3_js_2.PublicKey('funeUsHgi2QKkLdUPASRLuYkaK8JaazCEz3HikbkhVt'),
        launchTs: 1701880540000,
        oracleSource: OracleSource.PYTH,
    },
    JTO: {
        fullName: 'Jito',
        category: ['MEV', 'Solana'],
        symbol: 'JTO-PERP',
        baseAssetSymbol: 'JTO',
        marketIndex: 20,
        oracle: new web3_js_2.PublicKey('D8UUgr8a3aR3yUeHLu7v8FWK7E8Y5sSU7qrYBXUJXBQ5'),
        launchTs: 1701967240000,
        oracleSource: OracleSource.PYTH,
    },
    SEI: {
        fullName: 'SEI',
        category: ['L1'],
        symbol: 'SEI-PERP',
        baseAssetSymbol: 'SEI',
        marketIndex: 21,
        oracle: new web3_js_2.PublicKey('6cUuAyAX3eXoiWkjFF77RQBEUF15AAMQ7d1hm4EPd3tv'),
        launchTs: 1703173331000,
        oracleSource: OracleSource.PYTH,
    },
    AVAX: {
        fullName: 'AVAX',
        category: ['Rollup', 'Infra'],
        symbol: 'AVAX-PERP',
        baseAssetSymbol: 'AVAX',
        marketIndex: 22,
        oracle: new web3_js_2.PublicKey('Ax9ujW5B9oqcv59N8m6f1BpTBq2rGeGaBcpKjC5UYsXU'),
        launchTs: 1704209558000,
        oracleSource: OracleSource.PYTH,
    },
    WIF: {
        fullName: 'WIF',
        category: ['Meme', 'Dog', 'Solana'],
        symbol: 'WIF-PERP',
        baseAssetSymbol: 'WIF',
        marketIndex: 23,
        oracle: new web3_js_2.PublicKey('6ABgrEZk8urs6kJ1JNdC1sspH5zKXRqxy8sg3ZG2cQps'),
        launchTs: 1706219971000,
        oracleSource: OracleSource.PYTH,
    },
    JUP: {
        fullName: 'JUP',
        category: ['Exchange', 'Infra', 'Solana'],
        symbol: 'JUP-PERP',
        baseAssetSymbol: 'JUP',
        marketIndex: 24,
        oracle: new web3_js_2.PublicKey('g6eRCbboSwK4tSWngn773RCMexr1APQr4uA9bGZBYfo'),
        launchTs: 1706713201000,
        oracleSource: OracleSource.PYTH,
    },
    DYM: {
        fullName: 'Dymension',
        category: ['Rollup', 'Infra'],
        symbol: 'DYM-PERP',
        baseAssetSymbol: 'DYM',
        marketIndex: 25,
        oracle: new web3_js_2.PublicKey('CSRRrhXa6DYu1W5jf89A7unCATdug2Z33tYyV2NXZZxa'),
        launchTs: 1708448765000,
        oracleSource: OracleSource.PYTH,
    },
    TAO: {
        fullName: 'BITTENSOR',
        category: ['AI', 'Infra'],
        symbol: 'TAO-PERP',
        baseAssetSymbol: 'TAO',
        marketIndex: 26,
        oracle: new web3_js_2.PublicKey('5NxzemFgGDhimYE3S5qmb5zkjZUmiHXb4up5WGXe7NLn'),
        launchTs: 1709136669000,
        oracleSource: OracleSource.PYTH,
    },
    W: {
        fullName: 'Wormhole',
        category: ['Bridge'],
        symbol: 'W-PERP',
        baseAssetSymbol: 'W',
        marketIndex: 27,
        oracle: new web3_js_2.PublicKey('H9j8CT1bFiWHaZUPMooEaxMRHdWdJ5T9CzFn41z96JHW'),
        launchTs: 1710418343000,
        oracleSource: OracleSource.PYTH,
    },
    KMNO: {
        fullName: 'Kamino',
        category: ['Lending', 'Solana'],
        symbol: 'KMNO-PERP',
        baseAssetSymbol: 'KMNO',
        marketIndex: 28,
        oracle: new web3_js_2.PublicKey('sDAQaZQJQ4RXAxH3x526mbEXyQZT15ktkL84d7hmk7M'),
        launchTs: 1712240681000,
        oracleSource: OracleSource.Prelaunch,
    },
    TNSR: {
        fullName: 'Tensor',
        category: ['NFT', 'Solana'],
        symbol: 'TNSR-PERP',
        baseAssetSymbol: 'TNSR',
        marketIndex: 29,
        oracle: new web3_js_2.PublicKey('7Cfyymx49ipGsgEsCA2XygAB2DUsan4C6Cyb5c8oR5st'),
        launchTs: 1712593532000,
        oracleSource: OracleSource.SWITCHBOARD,
    }
};
