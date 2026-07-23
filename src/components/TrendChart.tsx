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

// Custom tooltip matching the unified system design
const CustomTooltip = ({ active, payload, label, unit, metricLabel }: any) => {
  if (active && payload && payload.length) {
    const value = payload[0].value;
    return (
      <div className="bg-white border border-rule shadow-sm p-3 rounded-md min-w-[130px]">
        <p className="font-mono text-[10px] tracking-widest text-ink/50 uppercase mb-1.5">
          {label}
        </p>
        <div className="flex justify-between items-center gap-4 text-sm">
          <span className="text-ink/60">{metricLabel}</span>
          <span className="font-mono font-medium text-ink">
            {value} {unit}
          </span>
        </div>
      </div>
    );
  }
  return null;
};

export default function TrendChart({ entries, dataKey, label, unit, color }: Props) {
  const data = entries
    .filter((e) => e[dataKey] !== null && e[dataKey] !== undefined)
    .sort((a, b) => new Date(a.entry_date).getTime() - new Date(b.entry_date).getTime())
    .map((e) => ({
      date: new Date(e.entry_date).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      }),
      value: e[dataKey] as number,
    }));

  if (data.length === 0) {
    return (
      <div className="border border-rule rounded-md p-8 flex flex-col items-center justify-center text-center bg-stone-50/50 h-[260px]">
        <p className="font-mono text-xs text-ink/40 uppercase tracking-widest mb-1">{label}</p>
        <p className="text-sm text-ink/60">No entries recorded yet.</p>
      </div>
    );
  }

  const latestValue = data[data.length - 1].value;

  return (
    <div className="border border-rule rounded-md bg-white overflow-hidden shadow-sm">
      {/* Header matching dashboard card patterns */}
      <div className="p-5 border-b border-rule bg-stone-50/30 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-ink">
            {label}
          </h3>
          <p className="text-xs text-ink/60 mt-0.5">Historical tracking over time</p>
        </div>
        <div className="text-right">
          <span className="font-mono text-base font-semibold text-ink">
            {latestValue} <span className="text-xs text-ink/50 font-normal">{unit}</span>
          </span>
        </div>
      </div>

      {/* Chart Content */}
      <div className="p-5">
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={data} margin={{ top: 5, right: 0, left: -25, bottom: 0 }}>
            <CartesianGrid 
              stroke="#000000" 
              strokeOpacity={0.04} 
              vertical={false} 
            />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 11, fill: "#1C2B2A", opacity: 0.4 }}
              axisLine={false}
              tickLine={false}
              dy={10}
            />
            <YAxis
              tick={{ fontSize: 11, fill: "#1C2B2A", opacity: 0.4 }}
              axisLine={false}
              tickLine={false}
              domain={["dataMin - 1", "dataMax + 1"]}
            />
            <Tooltip
              content={<CustomTooltip unit={unit} metricLabel={label} />}
              cursor={{ stroke: '#1C2B2A', strokeOpacity: 0.1, strokeWidth: 2 }}
            />
            <Line
              type="monotone"
              dataKey="value"
              stroke={color}
              strokeWidth={2.5}
              dot={false}
              activeDot={{ r: 5, fill: color, stroke: "#fff", strokeWidth: 2 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}