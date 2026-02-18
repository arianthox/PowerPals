import { ipcMain } from 'electron';
import { prisma } from '@agent-battery/db';
import { channels, usageHistoryPayloadSchema } from '@agent-battery/shared';
import { syncService } from '../services/syncService.js';

export function registerUsageHandlers() {
  ipcMain.handle(channels.usage.listLatest, async () => {
    const latest = await prisma.usageSnapshot.findMany({
      orderBy: { fetchedAt: 'desc' }
    });

    const seen = new Set<string>();
    const deduped = latest.filter((row) => {
      if (seen.has(row.accountId)) return false;
      seen.add(row.accountId);
      return true;
    });

    return {
      ok: true,
      data: deduped.map((row) => ({
        ...row,
        windowStart: row.windowStart.toISOString(),
        windowEnd: row.windowEnd.toISOString(),
        fetchedAt: row.fetchedAt.toISOString(),
        createdAt: row.createdAt.toISOString()
      }))
    };
  });

  ipcMain.handle(channels.usage.history, async (_event, payload) => {
    const parsed = usageHistoryPayloadSchema.safeParse(payload);
    if (!parsed.success) return { ok: false, error: parsed.error.message };

    const rows = await prisma.usageSnapshot.findMany({
      where: {
        accountId: parsed.data.accountId,
        windowStart: { gte: new Date(parsed.data.window.start) },
        windowEnd: { lte: new Date(parsed.data.window.end) }
      },
      orderBy: { fetchedAt: 'asc' }
    });

    return {
      ok: true,
      data: rows.map((row) => ({
        ...row,
        windowStart: row.windowStart.toISOString(),
        windowEnd: row.windowEnd.toISOString(),
        fetchedAt: row.fetchedAt.toISOString(),
        createdAt: row.createdAt.toISOString()
      }))
    };
  });

  ipcMain.handle(channels.usage.manualSync, async (_event, accountId: string) => {
    await syncService.syncAccount(accountId, {
      type: 'billing_cycle',
      start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      end: new Date().toISOString()
    });
    return { ok: true };
  });
}
