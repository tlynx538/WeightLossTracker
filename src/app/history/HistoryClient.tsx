"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Entry, DailyLog } from "@/lib/types";

type Props = {
  userEmail: string;
  displayName: string | null;
  entries: Entry[];
  dailyLogs: DailyLog[];
};

// Helper to format date
const formatDate = (dateStr: string) =>
  new Date(dateStr).toLocaleDateString("en-US", {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
  });

// Helper to get weight for a specific date
function getWeightForDate(entries: Entry[], date: string): number | null {
  const entry = entries.find((e) => e.entry_date === date);
  return entry ? entry.weight_kg : null;
}

// Component to render a single daily log card
function DailyLogCard({ log, weight }: { log: DailyLog; weight: number | null }) {
  return (
    <div className="border border-rule rounded-md bg-white p-5 space-y-3 shadow-sm hover:shadow-md transition-shadow">
      {/* Date and Weight */}
      <div className="flex items-center justify-between border-b border-rule pb-3">
        <h3 className="font-mono text-sm font-bold text-ink">
          {formatDate(log.log_date)}
        </h3>
        <div className="text-right">
          {weight !== null ? (
            <span className="text-lg font-bold text-pine">{weight} kg</span>
          ) : (
            <span className="text-xs text-ink/40">No weight logged</span>
          )}
        </div>
      </div>

      {/* Sleep */}
      {(log.sleep_hours !== null || log.sleep_quality !== null || log.bedtime || log.wake_time) && (
        <div>
          <p className="text-[10px] uppercase tracking-wider text-ink/50 font-mono mb-1">Sleep</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-1 text-sm">
            {log.sleep_hours !== null && <span>🕐 {log.sleep_hours}h</span>}
            {log.sleep_quality !== null && <span>⭐ {log.sleep_quality}/10</span>}
            {log.bedtime && <span>🌙 {log.bedtime}</span>}
            {log.wake_time && <span>☀️ {log.wake_time}</span>}
          </div>
        </div>
      )}

      {/* Hydration, Mood, Energy, Stress, Focus */}
      {(log.water_l !== null || log.mood !== null || log.energy !== null || log.stress !== null || log.focus !== null) && (
        <div>
          <p className="text-[10px] uppercase tracking-wider text-ink/50 font-mono mb-1">State</p>
          <div className="flex flex-wrap gap-3 text-sm">
            {log.water_l !== null && <span>💧 {log.water_l}L</span>}
            {log.mood !== null && <span>😊 {log.mood}/10</span>}
            {log.energy !== null && <span>⚡ {log.energy}/10</span>}
            {log.stress !== null && <span>😰 {log.stress}/10</span>}
            {log.focus !== null && <span>🎯 {log.focus}/10</span>}
          </div>
        </div>
      )}

      {/* Digestion */}
      {(log.digestion_rating !== null || log.constipation || log.diarrhea || log.bloating || log.acid_reflux) && (
        <div>
          <p className="text-[10px] uppercase tracking-wider text-ink/50 font-mono mb-1">Digestion</p>
          <div className="flex flex-wrap gap-3 text-sm">
            {log.digestion_rating !== null && <span>{log.digestion_rating}/10</span>}
            {log.constipation && <span>🚫 Constipation</span>}
            {log.diarrhea && <span>💩 Diarrhea</span>}
            {log.bloating && <span>🎈 Bloating</span>}
            {log.acid_reflux && <span>🔥 Acid reflux</span>}
          </div>
        </div>
      )}

      {/* Nutrition */}
      {(log.breakfast || log.lunch || log.dinner || log.snacks || log.fruit_servings !== null || log.veg_servings !== null) && (
        <div>
          <p className="text-[10px] uppercase tracking-wider text-ink/50 font-mono mb-1">Nutrition</p>
          <div className="space-y-1 text-sm">
            {log.breakfast && <div>🥣 Breakfast: {log.breakfast}</div>}
            {log.lunch && <div>🥗 Lunch: {log.lunch}</div>}
            {log.dinner && <div>🍽️ Dinner: {log.dinner}</div>}
            {log.snacks && <div>🍿 Snacks: {log.snacks}</div>}
            <div className="flex flex-wrap gap-3">
              {log.fruit_servings !== null && <span>🍎 {log.fruit_servings} servings fruit</span>}
              {log.veg_servings !== null && <span>🥦 {log.veg_servings} servings veg</span>}
              {log.restaurant_meal && <span>🍔 Restaurant meal</span>}
              {log.protein_target_met && <span>💪 Protein goal met</span>}
            </div>
          </div>
        </div>
      )}

      {/* Training */}
      {(log.workout_today || log.workout_type || log.workout_duration_min !== null || log.cardio_duration_min !== null || log.steps !== null || log.pain_today !== null) && (
        <div>
          <p className="text-[10px] uppercase tracking-wider text-ink/50 font-mono mb-1">Training</p>
          <div className="flex flex-wrap gap-3 text-sm">
            {log.workout_today && <span>🏋️ {log.workout_type || "Workout"}</span>}
            {log.workout_duration_min !== null && <span>⏱️ {log.workout_duration_min} min</span>}
            {log.cardio_duration_min !== null && <span>🏃 {log.cardio_duration_min} min cardio</span>}
            {log.steps !== null && <span>👣 {log.steps} steps</span>}
            {log.pain_today !== null && <span>💢 Pain: {log.pain_today}/10</span>}
          </div>
        </div>
      )}

      {/* Habits */}
      {(
        log.habit_protein_breakfast ||
        log.habit_meal_prepped ||
        log.habit_water_goal ||
        log.habit_workout ||
        log.habit_no_delivery ||
        log.habit_logged_food
      ) && (
        <div>
          <p className="text-[10px] uppercase tracking-wider text-ink/50 font-mono mb-1">Habits</p>
          <div className="flex flex-wrap gap-2">
            {log.habit_protein_breakfast && <span className="text-xs bg-pine/10 text-pine px-2 py-0.5 rounded-full">✅ Protein breakfast</span>}
            {log.habit_meal_prepped && <span className="text-xs bg-pine/10 text-pine px-2 py-0.5 rounded-full">✅ Meal prepped</span>}
            {log.habit_water_goal && <span className="text-xs bg-pine/10 text-pine px-2 py-0.5 rounded-full">✅ Water goal</span>}
            {log.habit_workout && <span className="text-xs bg-pine/10 text-pine px-2 py-0.5 rounded-full">✅ Workout done</span>}
            {log.habit_no_delivery && <span className="text-xs bg-pine/10 text-pine px-2 py-0.5 rounded-full">✅ No delivery</span>}
            {log.habit_logged_food && <span className="text-xs bg-pine/10 text-pine px-2 py-0.5 rounded-full">✅ Food logged</span>}
          </div>
        </div>
      )}

      {/* Notes */}
      {log.notes && (
        <div className="pt-2 border-t border-rule/50">
          <p className="text-xs text-ink/70 italic">📝 {log.notes}</p>
        </div>
      )}
    </div>
  );
}

export default function HistoryClient({ userEmail, displayName, entries, dailyLogs }: Props) {
  const supabase = createClient();
  const router = useRouter();

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  // Map entries by date for quick lookup
  const weightMap = new Map<string, number>();
  entries.forEach((e) => {
    weightMap.set(e.entry_date, e.weight_kg);
  });

  return (
    <main className="min-h-screen max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
      {/* Header */}
      <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between pb-6 border-b border-rule">
        <div>
          <p className="font-mono text-xs tracking-widest text-pine uppercase mb-1">
            Logbook
          </p>
          <h1 className="text-2xl font-bold text-ink">
            {displayName ? `${displayName}'s history` : "Your history"}
          </h1>
          <p className="text-xs text-ink/50 mt-1 break-all">{userEmail}</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <Link
            href="/dashboard"
            className="w-full sm:w-auto text-xs font-mono text-ink/50 hover:text-pine border border-rule rounded-sm px-4 py-2 transition-colors text-center"
          >
            Dashboard
          </Link>
          <button
            onClick={handleLogout}
            className="w-full sm:w-auto text-xs font-mono text-ink/50 hover:text-rust border border-rule rounded-sm px-4 py-2 transition-colors"
          >
            Sign out
          </button>
        </div>
      </header>

      <div className="mt-6 space-y-4">
        {dailyLogs.length === 0 ? (
          <div className="text-center text-ink/50 py-12">
            No daily logs yet. Start logging your daily health to see history here.
          </div>
        ) : (
          dailyLogs.map((log) => (
            <DailyLogCard
              key={log.id}
              log={log}
              weight={weightMap.get(log.log_date) || null}
            />
          ))
        )}
      </div>
    </main>
  );
}