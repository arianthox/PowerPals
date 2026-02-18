import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { CreateAccountPayload, UpdateAccountPayload } from '@agent-battery/shared';

export function useAccounts() {
  return useQuery({
    queryKey: ['accounts'],
    queryFn: async () => {
      const result = await window.agentBattery.account.list();
      if (!result.ok) throw new Error(result.error ?? 'Failed to load accounts');
      return result.data;
    }
  });
}

export function useLatestUsage() {
  return useQuery({
    queryKey: ['latest-usage'],
    queryFn: async () => {
      const result = await window.agentBattery.usage.listLatest();
      if (!result.ok) throw new Error(result.error ?? 'Failed to load usage');
      return result.data;
    }
  });
}

export function useSettings() {
  return useQuery({
    queryKey: ['settings'],
    queryFn: async () => {
      const result = await window.agentBattery.settings.get();
      if (!result.ok) throw new Error(result.error ?? 'Failed to load settings');
      return result.data;
    }
  });
}

export function useCreateAccount() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: CreateAccountPayload) => {
      const result = await window.agentBattery.account.create(payload);
      if (!result.ok) throw new Error(result.error ?? 'Failed to create account');
      return result.data;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['accounts'] });
    }
  });
}

export function useUpdateAccount() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: UpdateAccountPayload) => {
      const result = await window.agentBattery.account.update(payload);
      if (!result.ok) throw new Error(result.error ?? 'Failed to update account');
      return result.data;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['accounts'] });
      await queryClient.invalidateQueries({ queryKey: ['latest-usage'] });
    }
  });
}

export function useManualSync() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (accountId: string) => {
      const result = await window.agentBattery.usage.manualSync(accountId);
      if (!result.ok) throw new Error(result.error ?? 'Failed to sync account');
      return result;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['latest-usage'] });
      await queryClient.invalidateQueries({ queryKey: ['accounts'] });
    }
  });
}
