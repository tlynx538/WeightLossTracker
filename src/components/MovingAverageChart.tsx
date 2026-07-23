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
};

// Custom tooltip for a cleaner, native feel
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    // payload[0] is weight, payload[1] is movingAvg based on render order
    const rawWeight = payload.find((p: any) => p.dataKey === "weight")?.value;
    const trend = payload.find((p: any) => p.dataKey === "movingAvg")?.value;

    return (
      <div className="bg-white border border-rule shadow-sm p-3 rounded-md min-w-[140px]">
        <p className="font-mono text-[10px] tracking-widest text-ink/50 uppercase mb-2">
          {label}
        </p>
        <div className="space-y-1.5 text-sm">
          <div className="flex justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-pine"></div>
              <span className="font-medium text-ink">Trend</span>
            </div>
            <span className="font-mono font-medium">{trend} kg</span>
          </div>
          <div className="flex justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-ink/20"></div>
              <span className="text-ink/60">Daily</span>
            </div>
            <span className="font-mono text-ink/60">{rawWeight} kg</span>
          </div>
        </div>
      </div>
    );
  }
  return null;
};

export default function MovingAverageChart({ entries }: Props) {
  const sorted = [...entries].sort(
    (a, b) => new Date(a.entry_date).getTime() - new Date(b.entry_date).getTime()
  );

  if (sorted.length === 0) {
    return (
      <div className="border border-rule rounded-md bg-stone-50/50 p-6 flex items-center justify-center h-[280px]">
        <p className="text-sm text-ink/50">No weight entries yet.</p>
      </div>
    );
  }

  // Compute 7-day moving average
  const data = sorted.map((entry, index, arr) => {
    const start = Math.max(0, index - 6);
    const slice = arr.slice(start, index + 1);
    const avg = slice.reduce((sum, e) => sum + e.weight_kg, 0) / slice.length;
    return {
      date: new Date(entry.entry_date).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      }),
      weight: entry.weight_kg,
      movingAvg: Math.round(avg * 10) / 10,
    };
  });

  return (
    <div className="border border-rule rounded-md bg-white overflow-hidden shadow-sm">
      {/* Header acting as a clean Legend */}
      <div className="p-5 border-b border-rule bg-stone-50/30 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h3 className="text-sm font-bold text-ink mb-1">
            Weight Trend
          </h3>
          <p className="text-xs text-ink/60">
            Daily fluctuations vs. your smoothed 7-day average.
          </p>
        </div>
        
        <div className="flex items-center gap-4 text-xs font-mono text-ink/60">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-0.5 bg-pine rounded-full"></div>
            <span>7-Day Avg</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-0.5 bg-ink/20 rounded-full"></div>
            <span>Daily Log</span>
          </div>
        </div>
      </div>

      {/* Chart Area */}
      <div className="p-5">
        <ResponsiveContainer width="100%" height={240}>
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
              domain={["auto", "auto"]} 
              tick={{ fontSize: 11, fill: "#1C2B2A", opacity: 0.4 }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip 
              content={<CustomTooltip />} 
              cursor={{ stroke: '#1C2B2A', strokeOpacity: 0.1, strokeWidth: 2 }}
            />
            
            {/* Background Line: Daily raw weight */}
            <Line
              type="monotone"
              dataKey="weight"
              stroke="#1C2B2A"
              strokeOpacity={0.15}
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4, fill: "#1C2B2A", strokeWidth: 0 }}
            />
            
            {/* Hero Line: Smoothed Moving Average */}
            <Line
              type="monotone"
              dataKey="movingAvg"
              stroke="#2F6F62" // Pine
              strokeWidth={3}
              dot={false}
              activeDot={{ r: 5, fill: "#2F6F62", stroke: "#fff", strokeWidth: 2 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}