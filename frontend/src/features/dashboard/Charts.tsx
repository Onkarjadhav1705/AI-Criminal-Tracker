import { Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

const tooltipStyle = { background: "#0e151d", border: "1px solid #263240", borderRadius: 8, color: "#e7edf4" };

export function ActivityAreaChart({ data }: { data: Array<Record<string, number | string>> }) {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <AreaChart data={data}>
        <defs>
          <linearGradient id="activity" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#4fb3d8" stopOpacity={0.35} />
            <stop offset="95%" stopColor="#4fb3d8" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid stroke="#263240" vertical={false} />
        <XAxis dataKey="name" stroke="#8ea0b2" fontSize={11} />
        <YAxis stroke="#8ea0b2" fontSize={11} />
        <Tooltip contentStyle={tooltipStyle} />
        <Area type="monotone" dataKey="value" stroke="#4fb3d8" fill="url(#activity)" />
      </AreaChart>
    </ResponsiveContainer>
  );
}

export function PriorityBarChart({ data }: { data: Array<{ name: string; value: number }> }) {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={data}>
        <CartesianGrid stroke="#263240" vertical={false} />
        <XAxis dataKey="name" stroke="#8ea0b2" fontSize={11} />
        <YAxis stroke="#8ea0b2" fontSize={11} />
        <Tooltip contentStyle={tooltipStyle} />
        <Bar dataKey="value" radius={[4, 4, 0, 0]}>
          {data.map((_, index) => <Cell key={index} fill={["#4fb3d8", "#d6a84f", "#64b386", "#d85f5f"][index % 4]} />)}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

export function TrendLineChart({ data }: { data: Array<Record<string, number | string>> }) {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <LineChart data={data}>
        <CartesianGrid stroke="#263240" vertical={false} />
        <XAxis dataKey="name" stroke="#8ea0b2" fontSize={11} />
        <YAxis stroke="#8ea0b2" fontSize={11} />
        <Tooltip contentStyle={tooltipStyle} />
        <Line type="monotone" dataKey="relationships" stroke="#4fb3d8" strokeWidth={2} dot={false} />
        <Line type="monotone" dataKey="anomalies" stroke="#d6a84f" strokeWidth={2} dot={false} />
      </LineChart>
    </ResponsiveContainer>
  );
}
