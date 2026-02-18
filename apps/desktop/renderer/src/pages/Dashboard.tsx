import { useLatestUsage, useAccounts, useManualSync } from '@/hooks/useApi';
import { BatteryBadge } from '@/components/BatteryBadge';

export function DashboardPage() {
  const accounts = useAccounts();
  const usage = useLatestUsage();
  const manualSync = useManualSync();

  if (accounts.isLoading || usage.isLoading) return <p>Loading dashboard…</p>;

  const rows = (accounts.data ?? []).map((account: any) => {
    const snapshot = (usage.data ?? []).find((u: any) => u.accountId === account.id);
    return { account, snapshot };
  });

  return (
    <section>
      <h2>Dashboard</h2>
      <table className="table">
        <thead>
          <tr>
            <th>Provider</th>
            <th>Account</th>
            <th>Battery</th>
            <th>Used / Limit</th>
            <th>Last Sync</th>
            <th>Health</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(({ account, snapshot }: any) => (
            <tr key={account.id}>
              <td>{account.provider}</td>
              <td>{account.displayName}</td>
              <td>{snapshot ? <BatteryBadge value={snapshot.batteryPercent} /> : 'n/a'}</td>
              <td>
                {snapshot
                  ? `${snapshot.usedValue.toFixed(1)} ${snapshot.usedUnit} / ${snapshot.limitValue.toFixed(1)} ${snapshot.limitUnit}`
                  : '-'}
              </td>
              <td>{snapshot ? new Date(snapshot.fetchedAt).toLocaleString() : '-'}</td>
              <td>{account.status}</td>
              <td>
                <button type="button" onClick={() => manualSync.mutate(account.id)}>
                  Refresh
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
