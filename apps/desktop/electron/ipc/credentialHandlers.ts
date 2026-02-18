import { ipcMain } from 'electron';
import { prisma } from '@agent-battery/db';
import { channels, credentialSetPayloadSchema } from '@agent-battery/shared';
import { OpenAIAdapter } from '../providers/openai.adapter.js';
import { ClaudeAdapter } from '../providers/claude.adapter.js';
import { CursorAdapter } from '../providers/cursor.adapter.js';
import { credentialService } from '../services/credentialService.js';

const adapters = {
  openai: new OpenAIAdapter(),
  claude: new ClaudeAdapter(),
  cursor: new CursorAdapter()
};

export function registerCredentialHandlers() {
  ipcMain.handle(channels.credential.set, async (_event, payload) => {
    const parsed = credentialSetPayloadSchema.safeParse(payload);
    if (!parsed.success) return { ok: false, error: parsed.error.message };
    await credentialService.setCredential(parsed.data.accountId, parsed.data.credentialInput);
    return { ok: true };
  });

  ipcMain.handle(channels.credential.validate, async (_event, accountId: string) => {
    const account = await prisma.account.findUnique({ where: { id: accountId } });
    if (!account) return { ok: false, error: 'Account not found' };

    const adapter = adapters[account.provider];
    const result = await adapter.validateCredentials({
      ...account,
      createdAt: account.createdAt.toISOString(),
      updatedAt: account.updatedAt.toISOString(),
      lastValidatedAt: account.lastValidatedAt?.toISOString() ?? null,
      expiresAt: account.expiresAt?.toISOString() ?? null
    });

    await prisma.account.update({
      where: { id: account.id },
      data: {
        status: result.valid ? 'active' : 'invalid',
        lastValidatedAt: new Date(),
        expiresAt: result.expiresAt ? new Date(result.expiresAt) : account.expiresAt
      }
    });

    return { ok: true, data: result };
  });
}
