// app/lib/database-service.ts
import { PrismaClient } from "@prisma/client";
import {
  FundingData,
  OrderBook,
  OrderBookLevel,
  ExchangeData,
} from "./exchanges/base/exchange";

// Initialize Prisma Client
const prisma = new PrismaClient({
  log:
    process.env.NODE_ENV === "development"
      ? ["query", "error", "warn"]
      : ["error"],
});

interface SymbolData {
  symbol: string;
  fundingRate: string;
  openInterest: string;
  orderBook?: OrderBook;
}

// Define types for Prisma model results
interface LatestDataRecord {
  exchange: string;
  data: SymbolData[];
  timestamp: Date;
}

interface ExchangeSnapshotRecord {
  id?: number;
  exchange: string;
  data: SymbolData[];
  timestamp: Date;
}

interface CollectionHealthResult {
  exchange: string;
  lastSuccessfulRun?: Date;
  consecutiveErrors: number;
  isActive: boolean;
}

interface AggregateStats {
  totalExchanges: number;
  totalSymbols: number;
  totalOpenInterest: number;
  avgFundingRate: number;
  timestamp: Date;
}

interface FlattenedData {
  exchange: string;
  symbol: string;
  fundingRate: string;
  openInterest: string;
  orderBook?: OrderBook;
  timestamp: Date;
}

// Database service with optimized queries
export const dbService = {
  // Save exchange data as a single document
  async saveExchangeData(exchange: string, data: ExchangeData) {
    // Transform data into array format for JSON storage
    const symbolDataArray: SymbolData[] = Object.entries(data).map(
      ([symbol, symbolData]) => ({
        symbol,
        fundingRate: symbolData.fundingData.fundingRate,
        openInterest: symbolData.fundingData.openInterest,
        orderBook: symbolData.orderBook,
      }),
    );

    // Use transaction for atomic updates
    return await prisma.$transaction([
      // Save historical snapshot
      prisma.exchangeSnapshot.create({
        data: {
          exchange,
          data: symbolDataArray,
        },
      }),

      // Update latest data (upsert)
      prisma.latestData.upsert({
        where: { exchange },
        update: {
          data: symbolDataArray,
          timestamp: new Date(),
        },
        create: {
          exchange,
          data: symbolDataArray,
          timestamp: new Date(),
        },
      }),
    ]);
  },

  // Ultra-fast query for latest data (~1-2ms)
  async getLatestData(exchange?: string): Promise<LatestDataRecord[]> {
    if (exchange) {
      const result = await prisma.latestData.findUnique({
        where: { exchange },
      });
      return result ? [result as LatestDataRecord] : [];
    }

    return prisma.latestData.findMany({
      orderBy: { exchange: "asc" },
    }) as Promise<LatestDataRecord[]>;
  },

  // Get all latest data (optimized single query)
  async getAllLatestData(): Promise<FlattenedData[]> {
    const results = (await prisma.latestData.findMany({
      orderBy: { exchange: "asc" },
    })) as LatestDataRecord[];

    // Flatten for backward compatibility if needed
    const flattened: FlattenedData[] = [];
    results.forEach((result: LatestDataRecord) => {
      const data = result.data as SymbolData[];
      data.forEach((symbolData: SymbolData) => {
        flattened.push({
          exchange: result.exchange,
          symbol: symbolData.symbol,
          fundingRate: symbolData.fundingRate,
          openInterest: symbolData.openInterest,
          orderBook: symbolData.orderBook,
          timestamp: result.timestamp,
        });
      });
    });

    return flattened;
  },

  // Get latest data in document format
  async getLatestDataDocuments(): Promise<LatestDataRecord[]> {
    return prisma.latestData.findMany({
      orderBy: { exchange: "asc" },
    }) as Promise<LatestDataRecord[]>;
  },

  // Get historical snapshots
  async getHistoricalSnapshots(
    exchange?: string,
    startTime?: Date,
    endTime?: Date,
    limit = 100,
  ): Promise<ExchangeSnapshotRecord[]> {
    const where: any = {};
    if (exchange) where.exchange = exchange;
    if (startTime || endTime) {
      where.timestamp = {};
      if (startTime) where.timestamp.gte = startTime;
      if (endTime) where.timestamp.lte = endTime;
    }

    return prisma.exchangeSnapshot.findMany({
      where,
      orderBy: { timestamp: "desc" },
      take: limit,
    }) as Promise<ExchangeSnapshotRecord[]>;
  },

  // Get historical data for specific symbol (searches within JSON)
  async getHistoricalData(
    exchange?: string,
    symbol?: string,
    startTime?: Date,
    endTime?: Date,
    limit = 100,
  ): Promise<ExchangeSnapshotRecord[]> {
    const snapshots = await this.getHistoricalSnapshots(
      exchange,
      startTime,
      endTime,
      limit,
    );

    if (!symbol) return snapshots;

    // Filter snapshots to only include requested symbol
    return snapshots
      .map((snapshot: ExchangeSnapshotRecord) => {
        const data = snapshot.data as SymbolData[];
        const symbolData = data.find((d: SymbolData) => d.symbol === symbol);
        return {
          ...snapshot,
          data: symbolData ? [symbolData] : [],
        };
      })
      .filter(
        (snapshot: ExchangeSnapshotRecord) =>
          (snapshot.data as SymbolData[]).length > 0,
      );
  },

  // Get unique symbols across all exchanges
  async getUniqueSymbols(): Promise<string[]> {
    const latestData =
      (await prisma.latestData.findMany()) as LatestDataRecord[];
    const symbolSet = new Set<string>();

    latestData.forEach((record: LatestDataRecord) => {
      const data = record.data as SymbolData[];
      data.forEach((symbolData: SymbolData) => {
        symbolSet.add(symbolData.symbol);
      });
    });

    return Array.from(symbolSet).sort();
  },

  // Get active exchanges
  async getActiveExchanges(): Promise<string[]> {
    const data = await prisma.latestData.findMany({
      select: { exchange: true },
    });
    return data.map((d: { exchange: string }) => d.exchange).sort();
  },

  // Placeholder for collection status (removed for velocity)
  async updateCollectionStatus(
    exchange: string,
    error?: string,
  ): Promise<void> {
    // No-op for now, but keeping the interface for compatibility
    console.log(
      `Collection status: ${exchange} - ${error ? "Error" : "Success"}`,
    );
  },

  // Placeholder for collection health
  async getCollectionHealth(): Promise<CollectionHealthResult[]> {
    const exchanges = await this.getActiveExchanges();
    const latestData = await this.getLatestDataDocuments();

    return exchanges.map((exchange: string) => {
      const data = latestData.find(
        (d: LatestDataRecord) => d.exchange === exchange,
      );
      return {
        exchange,
        lastSuccessfulRun: data?.timestamp,
        consecutiveErrors: 0,
        isActive: true,
      };
    });
  },

  // Format decimal fields (compatibility helper)
  formatDecimalFields(data: any): any {
    // With the new schema, funding rates and OI are already strings
    return data;
  },

  // Get latest snapshot for an exchange with parsed data
  async getExchangeSnapshot(exchange: string): Promise<{
    exchange: string;
    timestamp: Date;
    data: SymbolData[];
  } | null> {
    const snapshot = (await prisma.latestData.findUnique({
      where: { exchange },
    })) as LatestDataRecord | null;

    if (!snapshot) return null;

    return {
      exchange: snapshot.exchange,
      timestamp: snapshot.timestamp,
      data: snapshot.data as SymbolData[],
    };
  },

  // Aggregate stats across all exchanges
  async getAggregateStats(): Promise<AggregateStats> {
    const latest = await this.getLatestDataDocuments();
    const stats: AggregateStats = {
      totalExchanges: latest.length,
      totalSymbols: 0,
      totalOpenInterest: 0,
      avgFundingRate: 0,
      timestamp: new Date(),
    };

    let fundingRateSum = 0;
    let fundingRateCount = 0;

    latest.forEach((record: LatestDataRecord) => {
      const data = record.data as SymbolData[];
      stats.totalSymbols += data.length;

      data.forEach((symbolData: SymbolData) => {
        const oi = parseFloat(symbolData.openInterest);
        const fr = parseFloat(symbolData.fundingRate);

        if (!isNaN(oi)) stats.totalOpenInterest += oi;
        if (!isNaN(fr)) {
          fundingRateSum += fr;
          fundingRateCount++;
        }
      });
    });

    if (fundingRateCount > 0) {
      stats.avgFundingRate = fundingRateSum / fundingRateCount;
    }

    return stats;
  },

  // Cleanup old snapshots (keep latest data forever)
  async cleanupOldSnapshots(daysToKeep = 30) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

    return prisma.exchangeSnapshot.deleteMany({
      where: {
        timestamp: {
          lt: cutoffDate,
        },
      },
    });
  },

  // Disconnect
  async disconnect(): Promise<void> {
    await prisma.$disconnect();
  },
};

// Export Prisma client for direct access if needed
export { prisma };
