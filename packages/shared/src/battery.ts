import type { UsageSnapshot } from './types.js';

export function computeBatteryPercent(usedValue: number, limitValue: number): number {
  if (limitValue <= 0) return 0;
  const raw = 100 - (usedValue / limitValue) * 100;
  return Math.max(0, Math.min(100, Number(raw.toFixed(2))));
}

export function deriveHealth(batteryPercent: number): 'ok' | 'warning' | 'critical' {
  if (batteryPercent <= 10) return 'critical';
  if (batteryPercent <= 30) return 'warning';
  return 'ok';
}

export function latestByAccount(snapshots: UsageSnapshot[]): Map<string, UsageSnapshot> {
  return snapshots.reduce((map, snapshot) => {
    const current = map.get(snapshot.accountId);
    if (!current || new Date(snapshot.fetchedAt).getTime() > new Date(current.fetchedAt).getTime()) {
      map.set(snapshot.accountId, snapshot);
    }
    return map;
  }, new Map<string, UsageSnapshot>());
}
