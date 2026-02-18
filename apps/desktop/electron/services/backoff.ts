export function computeBackoffMs(failures: number): number {
  return Math.min(60_000, 1000 * 2 ** failures);
}
