import {
  channels,
  createAccountPayloadSchema,
  thresholdSettingsSchema,
  usageHistoryPayloadSchema
} from '@agent-battery/shared';

describe('ipc contracts', () => {
  it('defines stable channel keys', () => {
    expect(channels.account.list).toBe('account:list');
    expect(channels.usage.manualSync).toBe('usage:manualSync');
  });

  it('validates create account payload', () => {
    const result = createAccountPayloadSchema.safeParse({
      provider: 'openai',
      displayName: 'Main',
      orgWorkspaceId: null,
      authType: 'manual',
      syncEnabled: true,
      syncIntervalSec: null,
      status: 'active'
    });

    expect(result.success).toBe(true);
  });

  it('rejects invalid settings payload', () => {
    const result = thresholdSettingsSchema.safeParse({
      lowBatteryPercent: 0,
      syncFailureCount: 3,
      pollingIntervalSec: 120,
      debugLogging: false
    });

    expect(result.success).toBe(false);
  });

  it('validates usage history payload', () => {
    const result = usageHistoryPayloadSchema.safeParse({
      accountId: '22817f4b-9055-44ff-a90d-5d7f1f464eb0',
      window: {
        type: 'billing_cycle',
        start: new Date(Date.now() - 1000).toISOString(),
        end: new Date().toISOString()
      }
    });

    expect(result.success).toBe(true);
  });
});
