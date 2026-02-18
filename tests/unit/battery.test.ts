import { computeBatteryPercent, deriveHealth } from '@agent-battery/shared';

describe('battery math', () => {
  it('computes battery percentage', () => {
    expect(computeBatteryPercent(25, 100)).toBe(75);
    expect(computeBatteryPercent(100, 100)).toBe(0);
    expect(computeBatteryPercent(0, 100)).toBe(100);
  });

  it('derives health levels', () => {
    expect(deriveHealth(80)).toBe('ok');
    expect(deriveHealth(20)).toBe('warning');
    expect(deriveHealth(9)).toBe('critical');
  });
});
