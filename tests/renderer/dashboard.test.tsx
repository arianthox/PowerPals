// @vitest-environment jsdom
import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { DashboardPage } from '../../apps/desktop/renderer/src/pages/Dashboard';

Object.defineProperty(window, 'agentBattery', {
  configurable: true,
  value: {
    account: {
      list: vi.fn().mockResolvedValue({
        ok: true,
        data: [
          {
            id: 'a1',
            provider: 'openai',
            displayName: 'Main',
            status: 'active'
          }
        ]
      })
    },
    usage: {
      listLatest: vi.fn().mockResolvedValue({
        ok: true,
        data: [
          {
            accountId: 'a1',
            batteryPercent: 50,
            usedValue: 50,
            usedUnit: 'requests',
            limitValue: 100,
            limitUnit: 'requests',
            fetchedAt: new Date().toISOString()
          }
        ]
      }),
      manualSync: vi.fn().mockResolvedValue({ ok: true })
    }
  }
});

describe('DashboardPage', () => {
  it('renders dashboard title', async () => {
    render(
      <QueryClientProvider client={new QueryClient()}>
        <DashboardPage />
      </QueryClientProvider>
    );

    expect(await screen.findByText('Dashboard')).toBeInTheDocument();
    expect(await screen.findByText('Main')).toBeInTheDocument();
  });
});
