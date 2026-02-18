import { contextBridge, ipcRenderer } from 'electron';
import { channels } from '@agent-battery/shared';

const api = {
  account: {
    list: () => ipcRenderer.invoke(channels.account.list),
    create: (payload: unknown) => ipcRenderer.invoke(channels.account.create, payload),
    update: (payload: unknown) => ipcRenderer.invoke(channels.account.update, payload),
    remove: (accountId: string) => ipcRenderer.invoke(channels.account.remove, accountId)
  },
  credential: {
    set: (payload: unknown) => ipcRenderer.invoke(channels.credential.set, payload),
    validate: (accountId: string) => ipcRenderer.invoke(channels.credential.validate, accountId)
  },
  usage: {
    listLatest: () => ipcRenderer.invoke(channels.usage.listLatest),
    history: (payload: unknown) => ipcRenderer.invoke(channels.usage.history, payload),
    manualSync: (accountId: string) => ipcRenderer.invoke(channels.usage.manualSync, accountId)
  },
  settings: {
    get: () => ipcRenderer.invoke(channels.settings.get),
    set: (payload: unknown) => ipcRenderer.invoke(channels.settings.set, payload)
  }
};

contextBridge.exposeInMainWorld('agentBattery', api);
