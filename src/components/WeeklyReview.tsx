"use client";

import { DailyLog, Entry, HABIT_FIELDS } from "@/lib/types";

type Props = {
  logs: DailyLog[];
  entries: Entry[];
};

// Calculate both this week and the week before
function getWeekRanges() {
  const now = new Date();
  
  const currentEnd = new Date(now);
  const currentStart = new Date(now);
  currentStart.setDate(currentStart.getDate() - 6);
  currentStart.setHours(0, 0, 0, 0);
  currentEnd.setHours(23, 59, 59, 999);

  const prevEnd = new Date(currentStart);
  prevEnd.setMilliseconds(prevEnd.getMilliseconds() - 1);
  const prevStart = new Date(prevEnd);
  prevStart.setDate(prevStart.getDate() - 6);
  prevStart.setHours(0, 0, 0, 0);

  return { currentStart, currentEnd, prevStart, prevEnd };
}

const formatDate = (date: Date) => 
  date.toLocaleDateString("en-US", { month: "short", day: "numeric" });

type TrendType = "positive" | "negative" | "neutral";
type TrendData = { text: string; type: TrendType } | null;

// Helper to calculate the difference between two periods
function getTrend(current: number | null, prev: number | null, options: { invert?: boolean; neutral?: boolean; isInt?: boolean } = {}): TrendData {
  if (current === null || prev === null) return null;
  
  const diff = current - prev;
  if (diff === 0) return { text: "No change", type: "neutral" };
  
  const absDiff = Math.abs(diff);
  const formattedDiff = options.isInt ? absDiff.toFixed(0) : absDiff.toFixed(1);
  const sign = diff > 0 ? "↑" : "↓";
  
  let type: TrendType = "neutral";
  if (!options.neutral) {
    if (diff > 0) type = options.invert ? "negative" : "positive";
    if (diff < 0) type = options.invert ? "positive" : "negative";
  }

  return { text: `${sign} ${formattedDiff}`, type };
}

// Helper component for clean stat display with trend indicator
function Stat({ label, value, unit, trend }: { label: string; value: React.ReactNode; unit?: string; trend?: TrendData }) {
  const trendColors = {
    positive: "bg-pine/10 text-pine",
    negative: "bg-rust/10 text-rust",
    neutral: "bg-stone-100 text-ink/60",
  };

  return (
    <div className="flex flex-col">
      <div className="flex items-center gap-1.5 mb-1">
        <span className="text-[10px] uppercase tracking-wider text-ink/50 font-mono">
          {label}
        </span>
        {trend && (
          <span className={`text-[9px] font-bold px-1 rounded-sm ${trendColors[trend.type]}`}>
            {trend.text}
          </span>
        )}
      </div>
      <span className="text-sm font-medium text-ink">
        {value} {unit && <span className="text-ink/50 text-xs font-normal">{unit}</span>}
      </span>
    </div>
  );
}

// Helper to calculate averages for a given set of logs/entries
function computeMetrics(logs: DailyLog[], entries: Entry[]) {
  const avgWeight = entries.length ? (entries.reduce((s, e) => s + e.weight_kg, 0) / entries.length) : null;
  const avgSleep = logs.length ? (logs.reduce((s, l) => s + (l.sleep_hours || 0), 0) / logs.length) : null;
  const gymSessions = logs.filter((l) => l.workout_today).length;
  const proteinGoalMet = logs.filter((l) => l.protein_target_met).length;
  const deliveryMeals = logs.filter((l) => l.restaurant_meal).length;
  const avgWater = logs.length ? (logs.reduce((s, l) => s + (l.water_l || 0), 0) / logs.length) : null;
  
  const avgMood = logs.length ? (logs.reduce((s, l) => s + (l.mood || 0), 0) / logs.length) : null;
  const avgEnergy = logs.length ? (logs.reduce((s, l) => s + (l.energy || 0), 0) / logs.length) : null;
  const avgDigestion = logs.length ? (logs.reduce((s, l) => s + (l.digestion_rating || 0), 0) / logs.length) : null;
  const avgPain = logs.length ? (logs.reduce((s, l) => s + (l.pain_today || 0), 0) / logs.length) : null;

  return { avgWeight, avgSleep, gymSessions, proteinGoalMet, deliveryMeals, avgWater, avgMood, avgEnergy, avgDigestion, avgPain };
}

export default function WeeklyReview({ logs, entries }: Props) {
  const { currentStart, currentEnd, prevStart, prevEnd } = getWeekRanges();
  
  const currentLogs = logs.filter((l) => new Date(l.log_date) >= currentStart && new Date(l.log_date) <= currentEnd);
  const currentEntries = entries.filter((e) => new Date(e.entry_date) >= currentStart && new Date(e.entry_date) <= currentEnd);
  
  const prevLogs = logs.filter((l) => new Date(l.log_date) >= prevStart && new Date(l.log_date) <= prevEnd);
  const prevEntries = entries.filter((e) => new Date(e.entry_date) >= prevStart && new Date(e.entry_date) <= prevEnd);

  if (currentLogs.length === 0 && currentEntries.length === 0) {
    return (
      <div className="border border-rule rounded-md p-8 flex flex-col items-center justify-center text-center bg-stone-50/50">
        <p className="font-mono text-xs text-ink/40 uppercase tracking-widest mb-2">Weekly Review</p>
        <p className="text-sm text-ink/60">No logs recorded in the past 7 days.</p>
      </div>
    );
  }

  const current = computeMetrics(currentLogs, currentEntries);
  const prev = computeMetrics(prevLogs, prevEntries);

  // Consistency score
  const habitDays = currentLogs.filter((l) => HABIT_FIELDS.filter((f) => l[f]).length >= 4).length;
  const prevHabitDays = prevLogs.filter((l) => HABIT_FIELDS.filter((f) => l[f]).length >= 4).length;
  
  const consistency = currentLogs.length ? Math.round((habitDays / currentLogs.length) * 100) : 0;
  const prevConsistency = prevLogs.length ? Math.round((prevHabitDays / prevLogs.length) * 100) : 0;
  const consistencyTrend = getTrend(consistency, prevConsistency, { isInt: true });

  // Best and worst day (Current Week Only)
  let bestDay: DailyLog | null = null;
  let worstDay: DailyLog | null = null;
  let bestScore = -1, worstScore = 999;
  for (const log of currentLogs) {
    const done = HABIT_FIELDS.filter((f) => log[f]).length;
    if (done > bestScore) { bestScore = done; bestDay = log; }
    if (done < worstScore) { worstScore = done; worstDay = log; }
  }

  const getDayName = (dateStr: string) => new Date(dateStr).toLocaleDateString("en-US", { weekday: "short" });

  return (
    <div className="border border-rule rounded-md bg-white overflow-hidden shadow-sm">
      {/* Header & Hero Metric */}
      <div className="p-5 border-b border-rule bg-stone-50/30 flex justify-between items-center">
        <div>
          <h3 className="font-mono text-xs uppercase tracking-widest text-ink/50 mb-1">
            Last 7 Days
          </h3>
          <p className="text-sm font-medium text-ink">
            {formatDate(currentStart)} &mdash; {formatDate(currentEnd)}
          </p>
        </div>
        <div className="text-right">
          <p className="font-mono text-[10px] uppercase tracking-wider text-ink/50 mb-1">Consistency</p>
          <div className="flex items-center gap-2">
            {consistencyTrend && consistencyTrend.type !== "neutral" && (
               <span className={`text-xs font-bold ${consistencyTrend.type === 'positive' ? 'text-pine' : 'text-rust'}`}>
                 {consistencyTrend.text}%
               </span>
            )}
            <span className={`text-xl font-bold ${consistency >= 75 ? 'text-pine' : consistency < 40 ? 'text-rust' : 'text-ink'}`}>
              {consistency}%
            </span>
          </div>
        </div>
      </div>

      {/* Grouped Stats Grid */}
      <div className="p-5 grid grid-cols-2 md:grid-cols-4 gap-y-6 gap-x-4">
        {/* Physical & Output */}
        {current.avgWeight !== null && <Stat label="Avg Weight" value={current.avgWeight.toFixed(1)} unit="kg" trend={getTrend(current.avgWeight, prev.avgWeight, { neutral: true })} />}
        {current.avgSleep !== null && <Stat label="Avg Sleep" value={current.avgSleep.toFixed(1)} unit="h" trend={getTrend(current.avgSleep, prev.avgSleep)} />}
        <Stat label="Gym Sessions" value={current.gymSessions} trend={getTrend(current.gymSessions, prev.gymSessions, { isInt: true })} />
        {current.avgWater !== null && <Stat label="Avg Water" value={current.avgWater.toFixed(1)} unit="L" trend={getTrend(current.avgWater, prev.avgWater)} />}

        {/* Nutrition */}
        <Stat label="Protein Met" value={current.proteinGoalMet} unit="days" trend={getTrend(current.proteinGoalMet, prev.proteinGoalMet, { isInt: true })} />
        <Stat label="Takeout" value={current.deliveryMeals} unit="meals" trend={getTrend(current.deliveryMeals, prev.deliveryMeals, { invert: true, isInt: true })} />

        {/* Subjective Wellbeing */}
        {current.avgMood !== null && <Stat label="Avg Mood" value={current.avgMood.toFixed(1)} unit="/ 10" trend={getTrend(current.avgMood, prev.avgMood)} />}
        {current.avgEnergy !== null && <Stat label="Avg Energy" value={current.avgEnergy.toFixed(1)} unit="/ 10" trend={getTrend(current.avgEnergy, prev.avgEnergy)} />}
        {current.avgDigestion !== null && <Stat label="Avg Digestion" value={current.avgDigestion.toFixed(1)} unit="/ 10" trend={getTrend(current.avgDigestion, prev.avgDigestion)} />}
        {current.avgPain !== null && <Stat label="Avg Pain" value={current.avgPain.toFixed(1)} unit="/ 10" trend={getTrend(current.avgPain, prev.avgPain, { invert: true })} />}
      </div>

      {/* Best/Worst Day Footer */}
      {(bestDay || worstDay) && (
        <div className="px-5 py-3 bg-stone-50/50 border-t border-rule text-xs flex gap-4 text-ink/70">
          {bestDay && (
            <p>High point: <strong className="text-pine">{getDayName(bestDay.log_date)}</strong></p>
          )}
          {worstDay && bestDay?.log_date !== worstDay?.log_date && (
            <p>Low point: <strong className="text-rust">{getDayName(worstDay.log_date)}</strong></p>
          )}
        </div>
      )}
    </div>
  );
}