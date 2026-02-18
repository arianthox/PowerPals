import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

type Point = {
  fetchedAt: string;
  batteryPercent: number;
};

export function UsageChart({ points }: { points: Point[] }) {
  return (
    <div style={{ width: '100%', height: 240 }}>
      <ResponsiveContainer>
        <LineChart data={points}>
          <XAxis dataKey="fetchedAt" tickFormatter={(v) => new Date(v).toLocaleTimeString()} />
          <YAxis domain={[0, 100]} />
          <Tooltip labelFormatter={(v) => new Date(v).toLocaleString()} />
          <Line type="monotone" dataKey="batteryPercent" stroke="#0f766e" strokeWidth={2} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
