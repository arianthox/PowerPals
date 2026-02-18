import { randomUUID } from 'node:crypto';
import { ipcMain } from 'electron';
import { prisma } from '@agent-battery/db';
import { channels, createAccountPayloadSchema, updateAccountPayloadSchema } from '@agent-battery/shared';
import { credentialService } from '../services/credentialService.js';

export function registerAccountHandlers() {
  ipcMain.handle(channels.account.list, async () => {
    const accounts = await prisma.account.findMany({ orderBy: { createdAt: 'desc' } });
    return {
      ok: true,
      data: accounts.map((account) => ({
        ...account,
        createdAt: account.createdAt.toISOString(),
        updatedAt: account.updatedAt.toISOString(),
        lastValidatedAt: account.lastValidatedAt?.toISOString() ?? null,
        expiresAt: account.expiresAt?.toISOString() ?? null
      }))
    };
  });

  ipcMain.handle(channels.account.create, async (_event, payload) => {
    const parsed = createAccountPayloadSchema.safeParse(payload);
    if (!parsed.success) return { ok: false, error: parsed.error.message };

    const accountId = randomUUID();
    const credentialRef = `${parsed.data.provider}:${accountId}`;

    const created = await prisma.account.create({
      data: {
        id: accountId,
        provider: parsed.data.provider,
        displayName: parsed.data.displayName,
        orgWorkspaceId: parsed.data.orgWorkspaceId,
        authType: parsed.data.authType,
        syncEnabled: parsed.data.syncEnabled,
        syncIntervalSec: parsed.data.syncIntervalSec,
        status: parsed.data.status,
        credentialRef
      }
    });

    if (parsed.data.credentialInput) {
      await credentialService.setCredential(created.id, parsed.data.credentialInput);
    }

    return {
      ok: true,
      data: {
        ...created,
        createdAt: created.createdAt.toISOString(),
        updatedAt: created.updatedAt.toISOString(),
        lastValidatedAt: created.lastValidatedAt?.toISOString() ?? null,
        expiresAt: created.expiresAt?.toISOString() ?? null
      }
    };
  });

  ipcMain.handle(channels.account.update, async (_event, payload) => {
    const parsed = updateAccountPayloadSchema.safeParse(payload);
    if (!parsed.success) return { ok: false, error: parsed.error.message };

    const updated = await prisma.account.update({
      where: { id: parsed.data.id },
      data: {
        provider: parsed.data.provider,
        displayName: parsed.data.displayName,
        orgWorkspaceId: parsed.data.orgWorkspaceId,
        authType: parsed.data.authType,
        syncEnabled: parsed.data.syncEnabled,
        syncIntervalSec: parsed.data.syncIntervalSec,
        status: parsed.data.status,
        expiresAt: parsed.data.expiresAt ? new Date(parsed.data.expiresAt) : undefined,
        lastError: parsed.data.lastError
      }
    });

    return {
      ok: true,
      data: {
        ...updated,
        createdAt: updated.createdAt.toISOString(),
        updatedAt: updated.updatedAt.toISOString(),
        lastValidatedAt: updated.lastValidatedAt?.toISOString() ?? null,
        expiresAt: updated.expiresAt?.toISOString() ?? null
      }
    };
  });

  ipcMain.handle(channels.account.remove, async (_event, accountId: string) => {
    await credentialService.deleteCredential(accountId);
    await prisma.account.delete({ where: { id: accountId } });
    return { ok: true };
  });
}
