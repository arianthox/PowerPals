import type { Account, UsageSnapshot, UsageWindow } from '@agent-battery/shared';

export interface ProviderAdapter {
  provider: Account['provider'];
  validateCredentials(account: Account): Promise<{ valid: boolean; expiresAt?: string }>;
  fetchUsage(account: Account, window: UsageWindow): Promise<unknown>;
  normalize(account: Account, raw: unknown, window: UsageWindow): UsageSnapshot;
}
