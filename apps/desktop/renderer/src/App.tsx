import { Nav } from '@/components/Nav';
import { DashboardPage } from '@/pages/Dashboard';
import { AccountsPage } from '@/pages/Accounts';
import { SettingsPage } from '@/pages/Settings';
import { useUiStore } from '@/stores/uiStore';

export function App() {
  const page = useUiStore((s) => s.page);

  return (
    <main className="app-shell">
      <h1>Agent Battery</h1>
      <Nav />
      {page === 'dashboard' && <DashboardPage />}
      {page === 'accounts' && <AccountsPage />}
      {page === 'settings' && <SettingsPage />}
    </main>
  );
}
