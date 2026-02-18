import { computeBackoffMs } from '../../apps/desktop/electron/services/backoff';

describe('sync backoff', () => {
  it('increases exponentially with cap', () => {
    expect(computeBackoffMs(1)).toBe(2000);
    expect(computeBackoffMs(2)).toBe(4000);
    expect(computeBackoffMs(6)).toBe(60000);
    expect(computeBackoffMs(10)).toBe(60000);
  });
});
