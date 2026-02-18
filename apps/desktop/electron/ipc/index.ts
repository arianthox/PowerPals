import { registerAccountHandlers } from './accountHandlers.js';
import { registerCredentialHandlers } from './credentialHandlers.js';
import { registerUsageHandlers } from './usageHandlers.js';
import { registerSettingsHandlers } from './settingsHandlers.js';

export function registerIpcHandlers() {
  registerAccountHandlers();
  registerCredentialHandlers();
  registerUsageHandlers();
  registerSettingsHandlers();
}
