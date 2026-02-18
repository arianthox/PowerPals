export type ProviderErrorType = 'auth' | 'network' | 'rate_limit' | 'parse' | 'unsupported';

export class ProviderError extends Error {
  constructor(
    message: string,
    public readonly type: ProviderErrorType,
    public readonly retryable = false
  ) {
    super(message);
    this.name = 'ProviderError';
  }
}
