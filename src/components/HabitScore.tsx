"use client";

import { DailyLog, HABIT_FIELDS } from "@/lib/types";

type Props = {
  log: DailyLog | null;
};

export default function HabitScore({ log }: Props) {
  if (!log) {
    return (
      <div className="card p-4 text-center text-ink/50">
        No log for today – fill out your daily log to see your habit score.
      </div>
    );
  }

  const total = HABIT_FIELDS.length;
  const done = HABIT_FIELDS.filter((field) => log[field]).length;
  const score = Math.round((done / total) * 100);

  return (
    <div className="card p-4">
      <div className="flex items-center justify-between">
        <h3 className="font-mono text-xs uppercase tracking-wide text-ink/60">
          Today’s Habit Score
        </h3>
        <span className="text-2xl font-bold text-pine">{score}%</span>
      </div>
      <div className="mt-2 flex gap-2 flex-wrap">
        {HABIT_FIELDS.map((field) => (
          <span
            key={field}
            className={`text-xs px-2 py-1 rounded-full ${
              log[field]
                ? "bg-pine/10 text-pine"
                : "bg-ink/5 text-ink/40"
            }`}
          >
            {log[field] ? "✅" : "⬜"} {field.replace("habit_", "").replace(/_/g, " ")}
          </span>
        ))}
      </div>
    </div>
  );
}