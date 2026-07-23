"use client";

import { DailyLog, HEALTH_WEIGHTS } from "@/lib/types";

type Props = {
  log: DailyLog | null;
};

export default function HealthSystemScore({ log }: Props) {
  if (!log) {
    return (
      <div className="card p-4 text-center text-ink/50">
        Log today to see your Health System Score.
      </div>
    );
  }

  let totalWeight = 0;
  let achievedWeight = 0;

  // habit_meal_prepped
  totalWeight += HEALTH_WEIGHTS.habit_meal_prepped;
  if (log.habit_meal_prepped) achievedWeight += HEALTH_WEIGHTS.habit_meal_prepped;

  // protein_target_met
  totalWeight += HEALTH_WEIGHTS.protein_target_met;
  if (log.protein_target_met) achievedWeight += HEALTH_WEIGHTS.protein_target_met;

  // habit_workout (but only if a workout was scheduled? we'll just use the habit)
  totalWeight += HEALTH_WEIGHTS.habit_workout;
  if (log.habit_workout) achievedWeight += HEALTH_WEIGHTS.habit_workout;

  // sleep_adequate
  totalWeight += HEALTH_WEIGHTS.sleep_adequate;
  if (log.sleep_hours !== null && log.sleep_hours >= 7) {
    achievedWeight += HEALTH_WEIGHTS.sleep_adequate;
  }

  // water_goal: assume goal is 2L
  totalWeight += HEALTH_WEIGHTS.water_goal;
  if (log.water_l !== null && log.water_l >= 2) {
    achievedWeight += HEALTH_WEIGHTS.water_goal;
  }

  // habit_logged_food
  totalWeight += HEALTH_WEIGHTS.habit_logged_food;
  if (log.habit_logged_food) achievedWeight += HEALTH_WEIGHTS.habit_logged_food;

  const score = totalWeight > 0 ? Math.round((achievedWeight / totalWeight) * 100) : 0;

  return (
    <div className="card p-4">
      <div className="flex items-center justify-between">
        <h3 className="font-mono text-xs uppercase tracking-wide text-ink/60">
          Health System Score
        </h3>
        <span className="text-2xl font-bold text-pine">{score}</span>
      </div>
      <div className="mt-2 text-xs text-ink/60">
        Based on daily habits and key nutrition/sleep metrics.
      </div>
      <div className="mt-2 w-full bg-rule h-1.5 rounded-full overflow-hidden">
        <div
          className="h-full bg-pine transition-all"
          style={{ width: `${score}%` }}
        />
      </div>
    </div>
  );
}