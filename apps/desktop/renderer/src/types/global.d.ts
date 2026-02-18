declare global {
  interface Window {
    agentBattery: {
      account: {
        list: () => Promise<any>;
        create: (payload: unknown) => Promise<any>;
        update: (payload: unknown) => Promise<any>;
        remove: (accountId: string) => Promise<any>;
      };
      credential: {
        set: (payload: unknown) => Promise<any>;
        validate: (accountId: string) => Promise<any>;
      };
      usage: {
        listLatest: () => Promise<any>;
        history: (payload: unknown) => Promise<any>;
        manualSync: (accountId: string) => Promise<any>;
      };
      settings: {
        get: () => Promise<any>;
        set: (payload: unknown) => Promise<any>;
      };
    };
  }
}

export {};
