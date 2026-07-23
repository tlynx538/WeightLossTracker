"use client";

import { useEffect, useState } from "react";
import { DailyLog, NewDailyLog, HABIT_FIELDS, HABIT_LABELS } from "@/lib/types";

type Props = {
  existingLogs: DailyLog[];
  onSubmit: (log: NewDailyLog) => Promise<void>;
};

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

function blankLog(date: string): NewDailyLog {
  return {
    log_date: date,
    sleep_hours: null,
    sleep_quality: null,
    bedtime: null,
    wake_time: null,
    water_l: null,
    mood: null,
    energy: null,
    stress: null,
    digestion_rating: null,
    constipation: false,
    diarrhea: false,
    bloating: false,
    acid_reflux: false,
    focus: null,
    breakfast: null,
    lunch: null,
    dinner: null,
    snacks: null,
    restaurant_meal: false,
    protein_target_met: false,
    fruit_servings: null,
    veg_servings: null,
    workout_today: false,
    workout_type: null,
    workout_duration_min: null,
    cardio_duration_min: null,
    steps: null,
    pain_today: null,
    habit_protein_breakfast: false,
    habit_meal_prepped: false,
    habit_water_goal: false,
    habit_workout: false,
    habit_no_delivery: false,
    habit_logged_food: false,
    notes: null,
  };
}

const WORKOUT_TYPES = [
  "Chest",
  "Back",
  "Legs",
  "Full Body",
  "Chest & Back",
  "Shoulders & Arms",
  "Recovery",
];

function Rating({
  label,
  value,
  onChange,
  max = 10,
}: {
  label: string;
  value: number | null;
  onChange: (v: number | null) => void;
  max?: number;
}) {
  return (
    <div>
      <label className="block text-xs text-ink/60 mb-1">
        {label} <span className="text-ink/30">(0–{max})</span>
      </label>
      <input
        type="number"
        min={0}
        max={max}
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value ? Number(e.target.value) : null)}
        className="w-full border border-rule bg-white/70 rounded-sm px-2 py-1.5 text-sm"
        placeholder="—"
      />
    </div>
  );
}

function Check({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex items-center gap-2 text-sm text-ink/80 cursor-pointer select-none">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="accent-pine w-4 h-4"
      />
      {label}
    </label>
  );
}

export default function DailyLogForm({ existingLogs, onSubmit }: Props) {
  const [date, setDate] = useState(todayISO());
  const [log, setLog] = useState<NewDailyLog>(blankLog(todayISO()));
  const [saving, setSaving] = useState(false);
  const [savedMsg, setSavedMsg] = useState<string | null>(null);

  useEffect(() => {
    const match = existingLogs.find((l) => l.log_date === date);
    setLog(match ? { ...match } : blankLog(date));
    setSavedMsg(null);
  }, [date, existingLogs]);

  function set<K extends keyof NewDailyLog>(key: K, value: NewDailyLog[K]) {
    setLog((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setSavedMsg(null);
    try {
      await onSubmit(log);
      setSavedMsg("Saved.");
    } catch (err) {
      // You could set an error state here
      console.error(err);
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="card p-5 space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="font-mono text-xs uppercase tracking-wide text-ink/60">
          Daily health log
        </h3>
        <input
          type="date"
          value={date}
          max={todayISO()}
          onChange={(e) => setDate(e.target.value)}
          className="border border-rule bg-white/70 rounded-sm px-2 py-1 text-xs"
        />
      </div>

      {/* Sleep */}
      <section className="space-y-2">
        <p className="text-xs font-medium text-ink/70">Sleep</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div>
            <label className="block text-xs text-ink/60 mb-1">Hours slept</label>
            <input
              type="number"
              step="0.1"
              value={log.sleep_hours ?? ""}
              onChange={(e) => set("sleep_hours", e.target.value ? Number(e.target.value) : null)}
              className="w-full border border-rule bg-white/70 rounded-sm px-2 py-1.5 text-sm"
            />
          </div>
          <Rating
            label="Sleep quality"
            value={log.sleep_quality}
            onChange={(v) => set("sleep_quality", v)}
          />
          <div>
            <label className="block text-xs text-ink/60 mb-1">Bedtime</label>
            <input
              type="time"
              value={log.bedtime ?? ""}
              onChange={(e) => set("bedtime", e.target.value || null)}
              className="w-full border border-rule bg-white/70 rounded-sm px-2 py-1.5 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs text-ink/60 mb-1">Wake time</label>
            <input
              type="time"
              value={log.wake_time ?? ""}
              onChange={(e) => set("wake_time", e.target.value || null)}
              className="w-full border border-rule bg-white/70 rounded-sm px-2 py-1.5 text-sm"
            />
          </div>
        </div>
      </section>

      <div className="tape-rule" />

      {/* Hydration / mood / energy / stress / focus */}
      <section className="space-y-2">
        <p className="text-xs font-medium text-ink/70">Hydration, mood & focus</p>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          <div>
            <label className="block text-xs text-ink/60 mb-1">Water (L)</label>
            <input
              type="number"
              step="0.1"
              value={log.water_l ?? ""}
              onChange={(e) => set("water_l", e.target.value ? Number(e.target.value) : null)}
              className="w-full border border-rule bg-white/70 rounded-sm px-2 py-1.5 text-sm"
            />
          </div>
          <Rating label="Mood" value={log.mood} onChange={(v) => set("mood", v)} />
          <Rating label="Energy" value={log.energy} onChange={(v) => set("energy", v)} />
          <Rating label="Stress" value={log.stress} onChange={(v) => set("stress", v)} />
          <Rating label="Focus" value={log.focus} onChange={(v) => set("focus", v)} />
        </div>
      </section>

      <div className="tape-rule" />

      {/* Digestion */}
      <section className="space-y-2">
        <p className="text-xs font-medium text-ink/70">Digestion</p>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 items-end">
          <Rating
            label="Digestion rating"
            value={log.digestion_rating}
            onChange={(v) => set("digestion_rating", v)}
          />
          <Check label="Constipation" checked={log.constipation} onChange={(v) => set("constipation", v)} />
          <Check label="Diarrhea" checked={log.diarrhea} onChange={(v) => set("diarrhea", v)} />
          <Check label="Bloating" checked={log.bloating} onChange={(v) => set("bloating", v)} />
          <Check label="Acid reflux" checked={log.acid_reflux} onChange={(v) => set("acid_reflux", v)} />
        </div>
      </section>

      <div className="tape-rule" />

      {/* Nutrition */}
      <section className="space-y-2">
        <p className="text-xs font-medium text-ink/70">Nutrition — no calorie counting, just consistency</p>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs text-ink/60 mb-1">Breakfast</label>
            <input
              type="text"
              value={log.breakfast ?? ""}
              onChange={(e) => set("breakfast", e.target.value || null)}
              className="w-full border border-rule bg-white/70 rounded-sm px-2 py-1.5 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs text-ink/60 mb-1">Lunch</label>
            <input
              type="text"
              value={log.lunch ?? ""}
              onChange={(e) => set("lunch", e.target.value || null)}
              className="w-full border border-rule bg-white/70 rounded-sm px-2 py-1.5 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs text-ink/60 mb-1">Dinner</label>
            <input
              type="text"
              value={log.dinner ?? ""}
              onChange={(e) => set("dinner", e.target.value || null)}
              className="w-full border border-rule bg-white/70 rounded-sm px-2 py-1.5 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs text-ink/60 mb-1">Snacks</label>
            <input
              type="text"
              value={log.snacks ?? ""}
              onChange={(e) => set("snacks", e.target.value || null)}
              className="w-full border border-rule bg-white/70 rounded-sm px-2 py-1.5 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs text-ink/60 mb-1">Fruit servings</label>
            <input
              type="number"
              min={0}
              value={log.fruit_servings ?? ""}
              onChange={(e) => set("fruit_servings", e.target.value ? Number(e.target.value) : null)}
              className="w-full border border-rule bg-white/70 rounded-sm px-2 py-1.5 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs text-ink/60 mb-1">Vegetable servings</label>
            <input
              type="number"
              min={0}
              value={log.veg_servings ?? ""}
              onChange={(e) => set("veg_servings", e.target.value ? Number(e.target.value) : null)}
              className="w-full border border-rule bg-white/70 rounded-sm px-2 py-1.5 text-sm"
            />
          </div>
          <Check
            label="Restaurant meal today?"
            checked={log.restaurant_meal}
            onChange={(v) => set("restaurant_meal", v)}
          />
          <Check
            label="Protein target met?"
            checked={log.protein_target_met}
            onChange={(v) => set("protein_target_met", v)}
          />
        </div>
      </section>

      <div className="tape-rule" />

      {/* Training */}
      <section className="space-y-2">
        <p className="text-xs font-medium text-ink/70">Training</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <Check
            label="Workout today?"
            checked={log.workout_today}
            onChange={(v) => set("workout_today", v)}
          />
          <div>
            <label className="block text-xs text-ink/60 mb-1">Workout type</label>
            <select
              value={log.workout_type ?? ""}
              onChange={(e) => set("workout_type", e.target.value || null)}
              className="w-full border border-rule bg-white/70 rounded-sm px-2 py-1.5 text-sm"
            >
              <option value="">—</option>
              {WORKOUT_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs text-ink/60 mb-1">Workout duration (min)</label>
            <input
              type="number"
              min={0}
              value={log.workout_duration_min ?? ""}
              onChange={(e) => set("workout_duration_min", e.target.value ? Number(e.target.value) : null)}
              className="w-full border border-rule bg-white/70 rounded-sm px-2 py-1.5 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs text-ink/60 mb-1">Cardio duration (min)</label>
            <input
              type="number"
              min={0}
              value={log.cardio_duration_min ?? ""}
              onChange={(e) => set("cardio_duration_min", e.target.value ? Number(e.target.value) : null)}
              className="w-full border border-rule bg-white/70 rounded-sm px-2 py-1.5 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs text-ink/60 mb-1">Steps</label>
            <input
              type="number"
              min={0}
              value={log.steps ?? ""}
              onChange={(e) => set("steps", e.target.value ? Number(e.target.value) : null)}
              className="w-full border border-rule bg-white/70 rounded-sm px-2 py-1.5 text-sm"
            />
          </div>
          <Rating label="Pain today" value={log.pain_today} onChange={(v) => set("pain_today", v)} />
        </div>
      </section>

      <div className="tape-rule" />

      {/* Habit checklist */}
      <section className="space-y-2">
        <p className="text-xs font-medium text-ink/70">Today&apos;s habit checklist</p>
        <div className="grid grid-cols-2 gap-2">
          {HABIT_FIELDS.map((field) => (
            <Check
              key={field}
              label={HABIT_LABELS[field]}
              checked={log[field]}
              onChange={(v) => set(field, v)}
            />
          ))}
        </div>
      </section>

      <div>
        <label className="block text-xs text-ink/60 mb-1">Notes</label>
        <input
          type="text"
          value={log.notes ?? ""}
          onChange={(e) => set("notes", e.target.value || null)}
          className="w-full border border-rule bg-white/70 rounded-sm px-2 py-1.5 text-sm"
          placeholder="Optional"
        />
      </div>

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={saving}
          className="bg-pine hover:bg-pine-dark text-white text-sm font-medium rounded-sm py-2 px-4 transition-colors disabled:opacity-60"
        >
          {saving ? "Saving…" : "Save day"}
        </button>
        {savedMsg && <span className="text-xs text-pine">{savedMsg}</span>}
      </div>
    </form>
  );
}