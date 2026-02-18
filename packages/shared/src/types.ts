export type Provider = 'openai' | 'claude' | 'cursor';
export type AuthType = 'apiKey' | 'session' | 'manual';
export type AccountStatus = 'active' | 'expired' | 'invalid' | 'error';
export type Confidence = 'exact' | 'estimated' | 'manual';
export type UsageSource = 'official_api' | 'official_export' | 'manual';
export type WindowType = 'hour' | 'day' | 'week' | 'month' | 'billing_cycle';

export interface Account {
  id: string;
  provider: Provider;
  displayName: string;
  orgWorkspaceId?: string | null;
  authType: AuthType;
  syncEnabled: boolean;
  syncIntervalSec?: number | null;
  status: AccountStatus;
  lastValidatedAt?: string | null;
  expiresAt?: string | null;
  lastError?: string | null;
  credentialRef: string;
  createdAt: string;
  updatedAt: string;
}

export interface UsageWindow {
  type: WindowType;
  start: string;
  end: string;
}

export interface UsageSnapshot {
  id: string;
  accountId: string;
  provider: Provider;
  windowType: WindowType;
  windowStart: string;
  windowEnd: string;
  usedValue: number;
  usedUnit: string;
  limitValue: number;
  limitUnit: string;
  remainingValue: number;
  batteryPercent: number;
  confidence: Confidence;
  source: UsageSource;
  fetchedAt: string;
  createdAt: string;
}

export interface BatteryStatus {
  accountId: string;
  provider: Provider;
  batteryPercent: number;
  remainingValue: number;
  usedValue: number;
  limitValue: number;
  usedUnit: string;
  lastSyncAt?: string;
  health: 'ok' | 'warning' | 'critical' | 'error';
}

export interface SyncRun {
  id: string;
  accountId: string;
  startedAt: string;
  finishedAt?: string | null;
  status: 'success' | 'failure';
  attempt: number;
  backoffMs: number;
  errorType?: string | null;
  errorMessage?: string | null;
}

export interface ProviderCredentialInput {
  apiKey?: string;
  sessionCookie?: string;
  refreshToken?: string;
}

export interface ThresholdSettings {
  lowBatteryPercent: number;
  syncFailureCount: number;
  pollingIntervalSec: number;
  debugLogging: boolean;
}
