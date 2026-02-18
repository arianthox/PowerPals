import { randomUUID } from 'node:crypto';
import { computeBatteryPercent } from '@agent-battery/shared';
import type { Account, UsageSnapshot, UsageWindow } from '@agent-battery/shared';
import { ProviderError } from './errors.js';
import type { ProviderAdapter } from './adapter.js';

export class ClaudeAdapter implements ProviderAdapter {
  provider: Account['provider'] = 'claude';

  async validateCredentials(account: Account): Promise<{ valid: boolean; expiresAt?: string }> {
    if (account.authType === 'manual') return { valid: true };
    return { valid: true };
  }

  async fetchUsage(account: Account, _window: UsageWindow): Promise<unknown> {
    if (account.authType === 'manual') {
      return { usedValue: 0, limitValue: 0, confidence: 'manual', source: 'manual' };
    }
    throw new ProviderError('Claude usage endpoint integration pending; use manual mode for now.', 'unsupported', false);
  }

  normalize(account: Account, raw: unknown, window: UsageWindow): UsageSnapshot {
    const payload = raw as { usedValue: number; limitValue: number; confidence: 'exact' | 'estimated' | 'manual'; source: 'official_api' | 'official_export' | 'manual' };
    const remainingValue = Math.max(0, payload.limitValue - payload.usedValue);
    const batteryPercent = computeBatteryPercent(payload.usedValue, payload.limitValue || 1);

    return {
      id: randomUUID(),
      accountId: account.id,
      provider: account.provider,
      windowType: window.type,
      windowStart: window.start,
      windowEnd: window.end,
      usedValue: payload.usedValue,
      usedUnit: 'tokens',
      limitValue: payload.limitValue,
      limitUnit: 'tokens',
      remainingValue,
      batteryPercent,
      confidence: payload.confidence,
      source: payload.source,
      fetchedAt: new Date().toISOString(),
      createdAt: new Date().toISOString()
    };
  }
}
