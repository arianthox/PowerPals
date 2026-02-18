import { useEffect, useState } from 'react';
import { useAccounts, useCreateAccount, useManualSync } from '@/hooks/useApi';
import { useUiStore } from '@/stores/uiStore';
import { UsageChart } from '@/components/UsageChart';

export function AccountsPage() {
  const { data: accounts = [], isLoading } = useAccounts();
  const createAccount = useCreateAccount();
  const manualSync = useManualSync();
  const [history, setHistory] = useState<any[]>([]);
  const selectedAccountId = useUiStore((s) => s.selectedAccountId);
  const setSelectedAccountId = useUiStore((s) => s.setSelectedAccountId);

  useEffect(() => {
    if (!selectedAccountId) return;
    void window.agentBattery.usage
      .history({
        accountId: selectedAccountId,
        window: {
          type: 'billing_cycle',
          start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
          end: new Date().toISOString()
        }
      })
      .then((result) => {
        if (result.ok) setHistory(result.data);
      });
  }, [selectedAccountId]);

  if (isLoading) return <p>Loading accounts…</p>;

  const selected = accounts.find((a: any) => a.id === selectedAccountId) ?? accounts[0];

  return (
    <section>
      <h2>Accounts</h2>
      <button
        type="button"
        onClick={() =>
          createAccount.mutate({
            provider: 'openai',
            displayName: `Account ${accounts.length + 1}`,
            orgWorkspaceId: null,
            authType: 'manual',
            syncEnabled: true,
            syncIntervalSec: null,
            status: 'active'
          } as any)
        }
      >
        Add Manual Account
      </button>

      <div className="split">
        <ul className="list">
          {accounts.map((account: any) => (
            <li key={account.id}>
              <button type="button" onClick={() => setSelectedAccountId(account.id)}>
                {account.displayName} ({account.provider})
              </button>
            </li>
          ))}
        </ul>

        <div>
          {selected ? (
            <>
              <h3>{selected.displayName}</h3>
              <p>Provider: {selected.provider}</p>
              <p>Status: {selected.status}</p>
              <p>Last error: {selected.lastError ?? 'none'}</p>
              <button type="button" onClick={() => manualSync.mutate(selected.id)}>
                Sync now
              </button>
              <h4>Snapshot trend</h4>
              <UsageChart points={history.map((x: any) => ({ fetchedAt: x.fetchedAt, batteryPercent: x.batteryPercent }))} />
            </>
          ) : (
            <p>No account selected.</p>
          )}
        </div>
      </div>
    </section>
  );
}
