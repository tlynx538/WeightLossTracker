"use client";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { Entry } from "@/lib/types";

type Props = {
  entries: Entry[];
  dataKey: keyof Entry;
  label: string;
  unit: string;
  color: string;
};

export default function TrendChart({ entries, dataKey, label, unit, color }: Props) {
  const data = entries
    .filter((e) => e[dataKey] !== null && e[dataKey] !== undefined)
    .map((e) => ({
      date: new Date(e.entry_date).toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
      }),
      value: e[dataKey] as number,
    }));

  if (data.length === 0) {
    return (
      <div className="card p-6 flex items-center justify-center h-56">
        <p className="text-sm text-ink/50">
          No {label.toLowerCase()} entries yet — log one below to see the trend.
        </p>
      </div>
    );
  }

  return (
    <div className="card p-4">
      <div className="flex items-baseline justify-between mb-2 px-2">
        <h3 className="font-mono text-xs uppercase tracking-wide text-ink/60">
          {label}
        </h3>
        <span className="font-mono text-sm text-ink">
          {data[data.length - 1].value} {unit}
        </span>
      </div>
      <ResponsiveContainer width="100%" height={200}>
        <LineChart data={data} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
          <CartesianGrid stroke="#D8D3C7" strokeDasharray="2 6" vertical={false} />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 11, fill: "#1C2B2A99" }}
            axisLine={{ stroke: "#D8D3C7" }}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 11, fill: "#1C2B2A99" }}
            axisLine={false}
            tickLine={false}
            domain={["dataMin - 1", "dataMax + 1"]}
            width={36}
          />
          <Tooltip
            contentStyle={{
              fontFamily: "var(--font-mono)",
              fontSize: 12,
              borderRadius: 2,
              border: "1px solid #D8D3C7",
            }}
            formatter={(value: number) => [`${value} ${unit}`, label]}
          />
          <Line
            type="monotone"
            dataKey="value"
            stroke={color}
            strokeWidth={2}
            dot={{ r: 3, fill: color }}
            activeDot={{ r: 5 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
