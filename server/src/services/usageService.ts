import type { Db } from "../lib/prisma.js";

export interface UsageService {
  /** Reserves `calls` outbound AI calls for today (UTC). False when the daily cap would be exceeded. */
  tryConsume(calls: number): Promise<boolean>;
}

// Persisted in DailyUsage so the cap survives restarts; Meta's spend notification doesn't stop billing.
export function createUsageService(db: Db, dailyCap: number): UsageService {
  return {
    async tryConsume(calls) {
      if (calls <= 0) return true;
      const day = new Date().toISOString().slice(0, 10);
      await db.dailyUsage.upsert({ where: { day }, create: { day }, update: {} });
      // Single conditional UPDATE: atomic under concurrent requests.
      const { count } = await db.dailyUsage.updateMany({
        where: { day, aiCalls: { lte: dailyCap - calls } },
        data: { aiCalls: { increment: calls } },
      });
      return count === 1;
    },
  };
}
