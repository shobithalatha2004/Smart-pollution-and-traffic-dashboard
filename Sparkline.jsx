import { ResponsiveContainer, LineChart, Line, Tooltip } from "recharts";

export default function Sparkline({ data = [], dataKey = "value", stroke = "var(--blue)", height = 48 }) {
  if (!data.length) {
    return <div style={{height}}/>;
  }
  return (
    <div style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <Tooltip
            labelFormatter={(t)=> new Date(t).toLocaleString()}
            formatter={(v)=> [typeof v === "number" ? v.toFixed(2) : v, ""]}
            contentStyle={{ fontSize: 12 }}
          />
          <Line type="monotone" dataKey={dataKey} dot={false} stroke={stroke} strokeWidth={2} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
