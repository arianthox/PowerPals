import type { UsageWindow } from '@agent-battery/shared';
import { ensureSettings, prisma } from '@agent-battery/db';
import { OpenAIAdapter } from '../providers/openai.adapter.js';
import { ClaudeAdapter } from '../providers/claude.adapter.js';
import { CursorAdapter } from '../providers/cursor.adapter.js';
import { ProviderError } from '../providers/errors.js';
import { logger } from './logger.js';
import { notificationService } from './notificationService.js';
import { computeBackoffMs } from './backoff.js';

const DEFAULT_INTERVAL_MS = 120_000;

const adapters = {
  openai: new OpenAIAdapter(),
  claude: new ClaudeAdapter(),
  cursor: new CursorAdapter()
};

export class SyncService {
  private timer: NodeJS.Timeout | null = null;
  private accountState = new Map<string, { failures: number; nextDelayMs: number }>();

  async start() {
    await ensureSettings();
    this.scheduleTick(DEFAULT_INTERVAL_MS);
  }

  stop() {
    if (this.timer) clearTimeout(this.timer);
  }

  private scheduleTick(baseMs: number) {
    const jitter = Math.floor(Math.random() * 5000);
    this.timer = setTimeout(() => void this.tick(), baseMs + jitter);
  }

  private async tick() {
    const settings = await prisma.appSetting.findUnique({ where: { id: 'singleton' } });
    const accounts = await prisma.account.findMany({ where: { syncEnabled: true } });

    for (const account of accounts) {
      await this.syncAccount(account.id, {
        type: 'billing_cycle',
        start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        end: new Date().toISOString()
      });

      const latest = await prisma.usageSnapshot.findFirst({ where: { accountId: account.id }, orderBy: { fetchedAt: 'desc' } });
      if (latest && settings && latest.batteryPercent <= settings.lowBatteryPercent) {
        notificationService.notify(
          `battery:${account.id}`,
          'Agent Battery: Low usage battery',
          `${account.displayName} is at ${latest.batteryPercent.toFixed(1)}% remaining.`
        );
      }
    }

    this.scheduleTick((settings?.pollingIntervalSec ?? 120) * 1000);
  }

  async syncAccount(accountId: string, window: UsageWindow): Promise<void> {
    const account = await prisma.account.findUnique({ where: { id: accountId } });
    if (!account) return;

    const state = this.accountState.get(accountId) ?? { failures: 0, nextDelayMs: 0 };
    if (state.nextDelayMs > 0) {
      await new Promise((resolve) => setTimeout(resolve, state.nextDelayMs));
    }

    const startedAt = new Date();
    let syncRunId: string | undefined;

    try {
      const run = await prisma.syncRun.create({
        data: {
          accountId,
          startedAt,
          status: 'success',
          attempt: state.failures + 1,
          backoffMs: state.nextDelayMs
        }
      });
      syncRunId = run.id;

      const adapter = adapters[account.provider];
      const raw = await adapter.fetchUsage({
        ...account,
        createdAt: account.createdAt.toISOString(),
        updatedAt: account.updatedAt.toISOString(),
        lastValidatedAt: account.lastValidatedAt?.toISOString() ?? null,
        expiresAt: account.expiresAt?.toISOString() ?? null
      }, window);

      const snapshot = adapter.normalize(
        {
          ...account,
          createdAt: account.createdAt.toISOString(),
          updatedAt: account.updatedAt.toISOString(),
          lastValidatedAt: account.lastValidatedAt?.toISOString() ?? null,
          expiresAt: account.expiresAt?.toISOString() ?? null
        },
        raw,
        window
      );

      await prisma.usageSnapshot.create({
        data: {
          ...snapshot,
          windowStart: new Date(snapshot.windowStart),
          windowEnd: new Date(snapshot.windowEnd),
          fetchedAt: new Date(snapshot.fetchedAt),
          createdAt: new Date(snapshot.createdAt)
        }
      });

      await prisma.account.update({
        where: { id: accountId },
        data: { status: 'active', lastValidatedAt: new Date(), lastError: null }
      });

      await prisma.syncRun.update({
        where: { id: syncRunId },
        data: { finishedAt: new Date(), status: 'success', attempt: 1, backoffMs: 0 }
      });

      this.accountState.set(accountId, { failures: 0, nextDelayMs: 0 });
    } catch (error) {
      const providerError =
        error instanceof ProviderError ? error : new ProviderError((error as Error).message, 'network', true);
      const failures = state.failures + 1;
      const backoffMs = computeBackoffMs(failures);
      this.accountState.set(accountId, { failures, nextDelayMs: backoffMs });

      await prisma.account.update({
        where: { id: accountId },
        data: { status: 'error', lastError: providerError.message }
      });

      if (syncRunId) {
        await prisma.syncRun.update({
          where: { id: syncRunId },
          data: {
            finishedAt: new Date(),
            status: 'failure',
            attempt: failures,
            backoffMs,
            errorType: providerError.type,
            errorMessage: providerError.message
          }
        });
      } else {
        await prisma.syncRun.create({
          data: {
            accountId,
            startedAt,
            finishedAt: new Date(),
            status: 'failure',
            attempt: failures,
            backoffMs,
            errorType: providerError.type,
            errorMessage: providerError.message
          }
        });
      }

      logger.warn('Sync failed', { accountId, error: providerError.message, type: providerError.type });

      const settings = await prisma.appSetting.findUnique({ where: { id: 'singleton' } });
      if (settings && failures >= settings.syncFailureCount) {
        notificationService.notify(
          `sync_failure:${accountId}`,
          'Agent Battery: sync failures',
          `Repeated sync failures for account ${account.displayName}.`
        );
      }
    }
  }
}

export const syncService = new SyncService();
