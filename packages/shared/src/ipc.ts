import { z } from 'zod';
import { accountSchema, thresholdSettingsSchema, usageSnapshotSchema, usageWindowSchema } from './schemas.js';

export const channels = {
  account: {
    list: 'account:list',
    create: 'account:create',
    update: 'account:update',
    remove: 'account:remove'
  },
  credential: {
    set: 'credential:set',
    validate: 'credential:validate'
  },
  usage: {
    listLatest: 'usage:listLatest',
    history: 'usage:history',
    manualSync: 'usage:manualSync'
  },
  settings: {
    get: 'settings:get',
    set: 'settings:set'
  }
} as const;

export const createAccountPayloadSchema = accountSchema
  .omit({
    id: true,
    credentialRef: true,
    createdAt: true,
    updatedAt: true,
    lastValidatedAt: true,
    lastError: true
  })
  .extend({
    credentialInput: z
      .object({
        apiKey: z.string().optional(),
        sessionCookie: z.string().optional(),
        refreshToken: z.string().optional()
      })
      .optional()
  });

export const updateAccountPayloadSchema = accountSchema.partial().extend({ id: z.string().uuid() });

export const credentialSetPayloadSchema = z.object({
  accountId: z.string().uuid(),
  credentialInput: z.object({
    apiKey: z.string().optional(),
    sessionCookie: z.string().optional(),
    refreshToken: z.string().optional()
  })
});

export const usageHistoryPayloadSchema = z.object({
  accountId: z.string().uuid(),
  window: usageWindowSchema
});

export const usageListLatestResponseSchema = z.array(usageSnapshotSchema);
export const settingsResponseSchema = thresholdSettingsSchema;

export type CreateAccountPayload = z.infer<typeof createAccountPayloadSchema>;
export type UpdateAccountPayload = z.infer<typeof updateAccountPayloadSchema>;
export type CredentialSetPayload = z.infer<typeof credentialSetPayloadSchema>;
export type UsageHistoryPayload = z.infer<typeof usageHistoryPayloadSchema>;

export interface IpcResult<T> {
  ok: boolean;
  data?: T;
  error?: string;
}
