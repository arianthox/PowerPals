import { OpenAIAdapter } from '../../apps/desktop/electron/providers/openai.adapter';
import { ClaudeAdapter } from '../../apps/desktop/electron/providers/claude.adapter';
import { CursorAdapter } from '../../apps/desktop/electron/providers/cursor.adapter';
import { ProviderError } from '../../apps/desktop/electron/providers/errors';

const account = {
  id: '22817f4b-9055-44ff-a90d-5d7f1f464eb0',
  provider: 'openai',
  displayName: 'A',
  authType: 'manual',
  syncEnabled: true,
  status: 'active',
  credentialRef: 'x',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  orgWorkspaceId: null,
  syncIntervalSec: null,
  lastValidatedAt: null,
  expiresAt: null,
  lastError: null
} as const;

const windowRange = {
  type: 'billing_cycle',
  start: new Date(Date.now() - 1000).toISOString(),
  end: new Date().toISOString()
} as const;

describe('provider adapters', () => {
  it('supports manual mode fetch and normalize', async () => {
    const adapter = new OpenAIAdapter();
    const raw = await adapter.fetchUsage(account as any, windowRange as any);
    const snapshot = adapter.normalize(account as any, raw, windowRange as any);
    expect(snapshot.source).toBe('manual');
    expect(snapshot.confidence).toBe('manual');
  });

  it('throws unsupported for non-manual currently', async () => {
    const adapter = new ClaudeAdapter();
    await expect(
      adapter.fetchUsage({ ...(account as any), authType: 'apiKey', provider: 'claude' }, windowRange as any)
    ).rejects.toBeInstanceOf(ProviderError);
  });

  it('validates cursor manual mode credentials', async () => {
    const adapter = new CursorAdapter();
    const result = await adapter.validateCredentials({ ...(account as any), provider: 'cursor' });
    expect(result.valid).toBe(true);
  });
});
