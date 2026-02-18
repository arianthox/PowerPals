import { create } from 'zustand';

export type Page = 'dashboard' | 'accounts' | 'settings';

interface UiStore {
  page: Page;
  selectedAccountId?: string;
  setPage: (page: Page) => void;
  setSelectedAccountId: (accountId?: string) => void;
}

export const useUiStore = create<UiStore>((set) => ({
  page: 'dashboard',
  selectedAccountId: undefined,
  setPage: (page) => set({ page }),
  setSelectedAccountId: (selectedAccountId) => set({ selectedAccountId })
}));
