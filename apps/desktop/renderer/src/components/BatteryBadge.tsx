export function BatteryBadge({ value }: { value: number }) {
  const level = value <= 10 ? 'critical' : value <= 30 ? 'warning' : 'ok';
  return <span className={`badge badge--${level}`}>{value.toFixed(1)}%</span>;
}
