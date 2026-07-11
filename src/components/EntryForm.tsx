"use client";

import { useState } from "react";
import { NewEntry } from "@/lib/types";

type Props = {
  onSubmit: (entry: NewEntry) => Promise<void>;
};

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

export default function EntryForm({ onSubmit }: Props) {
  const [date, setDate] = useState(todayISO());
  const [weight, setWeight] = useState("");
  const [waist, setWaist] = useState("");
  const [hip, setHip] = useState("");
  const [chest, setChest] = useState("");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const weightNum = parseFloat(weight);
    if (!weightNum || weightNum <= 0) {
      setError("Enter a valid weight.");
      return;
    }

    setSaving(true);
    try {
      await onSubmit({
        entry_date: date,
        weight_kg: weightNum,
        waist_cm: waist ? parseFloat(waist) : null,
        hip_cm: hip ? parseFloat(hip) : null,
        chest_cm: chest ? parseFloat(chest) : null,
        notes: notes || null,
      });
      setWeight("");
      setWaist("");
      setHip("");
      setChest("");
      setNotes("");
      setDate(todayISO());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="card p-5 space-y-4">
      <h3 className="font-mono text-xs uppercase tracking-wide text-ink/60">
        Log an entry
      </h3>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs text-ink/60 mb-1">Date</label>
          <input
            type="date"
            value={date}
            max={todayISO()}
            onChange={(e) => setDate(e.target.value)}
            className="w-full border border-rule bg-white/70 rounded-sm px-2 py-1.5 text-sm"
            required
          />
        </div>
        <div>
          <label className="block text-xs text-ink/60 mb-1">Weight (kg)</label>
          <input
            type="number"
            step="0.1"
            inputMode="decimal"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            className="w-full border border-rule bg-white/70 rounded-sm px-2 py-1.5 text-sm"
            placeholder="72.4"
            required
          />
        </div>
        <div>
          <label className="block text-xs text-ink/60 mb-1">Waist (cm)</label>
          <input
            type="number"
            step="0.1"
            inputMode="decimal"
            value={waist}
            onChange={(e) => setWaist(e.target.value)}
            className="w-full border border-rule bg-white/70 rounded-sm px-2 py-1.5 text-sm"
            placeholder="Optional"
          />
        </div>
        <div>
          <label className="block text-xs text-ink/60 mb-1">Hip (cm)</label>
          <input
            type="number"
            step="0.1"
            inputMode="decimal"
            value={hip}
            onChange={(e) => setHip(e.target.value)}
            className="w-full border border-rule bg-white/70 rounded-sm px-2 py-1.5 text-sm"
            placeholder="Optional"
          />
        </div>
        <div>
          <label className="block text-xs text-ink/60 mb-1">Chest (cm)</label>
          <input
            type="number"
            step="0.1"
            inputMode="decimal"
            value={chest}
            onChange={(e) => setChest(e.target.value)}
            className="w-full border border-rule bg-white/70 rounded-sm px-2 py-1.5 text-sm"
            placeholder="Optional"
          />
        </div>
        <div className="col-span-2">
          <label className="block text-xs text-ink/60 mb-1">Notes</label>
          <input
            type="text"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full border border-rule bg-white/70 rounded-sm px-2 py-1.5 text-sm"
            placeholder="Optional"
          />
        </div>
      </div>

      {error && <p className="text-sm text-rust">{error}</p>}

      <button
        type="submit"
        disabled={saving}
        className="w-full bg-pine hover:bg-pine-dark text-white text-sm font-medium rounded-sm py-2 transition-colors disabled:opacity-60"
      >
        {saving ? "Saving…" : "Save entry"}
      </button>
    </form>
  );
}
