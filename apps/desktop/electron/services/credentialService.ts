import keytar from 'keytar';
import type { ProviderCredentialInput } from '@agent-battery/shared';

const SERVICE_NAME = 'agent-battery';

export class CredentialService {
  async setCredential(accountId: string, credentialInput: ProviderCredentialInput): Promise<void> {
    await keytar.setPassword(SERVICE_NAME, accountId, JSON.stringify(credentialInput));
  }

  async getCredential(accountId: string): Promise<ProviderCredentialInput | null> {
    const raw = await keytar.getPassword(SERVICE_NAME, accountId);
    if (!raw) return null;
    return JSON.parse(raw) as ProviderCredentialInput;
  }

  async deleteCredential(accountId: string): Promise<void> {
    await keytar.deletePassword(SERVICE_NAME, accountId);
  }
}

export const credentialService = new CredentialService();
