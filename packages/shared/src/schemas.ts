import { z } from 'zod';

export const providerSchema = z.enum(['openai', 'claude', 'cursor']);
export const authTypeSchema = z.enum(['apiKey', 'session', 'manual']);
export const accountStatusSchema = z.enum(['active', 'expired', 'invalid', 'error']);
export const confidenceSchema = z.enum(['exact', 'estimated', 'manual']);
export const sourceSchema = z.enum(['official_api', 'official_export', 'manual']);
export const windowTypeSchema = z.enum(['hour', 'day', 'week', 'month', 'billing_cycle']);

export const usageWindowSchema = z.object({
  type: windowTypeSchema,
  start: z.string().datetime(),
  end: z.string().datetime()
});

export const accountSchema = z.object({
  id: z.string().uuid(),
  provider: providerSchema,
  displayName: z.string().min(1),
  orgWorkspaceId: z.string().optional().nullable(),
  authType: authTypeSchema,
  syncEnabled: z.boolean(),
  syncIntervalSec: z.number().int().positive().optional().nullable(),
  status: accountStatusSchema,
  lastValidatedAt: z.string().datetime().optional().nullable(),
  expiresAt: z.string().datetime().optional().nullable(),
  lastError: z.string().optional().nullable(),
  credentialRef: z.string().min(1),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime()
});

export const usageSnapshotSchema = z.object({
  id: z.string().uuid(),
  accountId: z.string().uuid(),
  provider: providerSchema,
  windowType: windowTypeSchema,
  windowStart: z.string().datetime(),
  windowEnd: z.string().datetime(),
  usedValue: z.number().nonnegative(),
  usedUnit: z.string().min(1),
  limitValue: z.number().positive(),
  limitUnit: z.string().min(1),
  remainingValue: z.number().nonnegative(),
  batteryPercent: z.number().min(0).max(100),
  confidence: confidenceSchema,
  source: sourceSchema,
  fetchedAt: z.string().datetime(),
  createdAt: z.string().datetime()
});

export const thresholdSettingsSchema = z.object({
  lowBatteryPercent: z.number().min(1).max(99),
  syncFailureCount: z.number().int().min(1).max(10),
  pollingIntervalSec: z.number().int().min(30).max(3600),
  debugLogging: z.boolean()
});

export type UsageWindowInput = z.infer<typeof usageWindowSchema>;
export type AccountInput = z.infer<typeof accountSchema>;
export type UsageSnapshotInput = z.infer<typeof usageSnapshotSchema>;
export type ThresholdSettingsInput = z.infer<typeof thresholdSettingsSchema>;
