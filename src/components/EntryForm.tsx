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
  const [neck, setNeck] = useState("");
  const [arm, setArm] = useState("");
  const [thigh, setThigh] = useState("");
  const [bodyFat, setBodyFat] = useState("");
  const [heartRate, setHeartRate] = useState("");
  const [photoFront, setPhotoFront] = useState("");
  const [photoSide, setPhotoSide] = useState("");
  const [photoBack, setPhotoBack] = useState("");
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
        neck_cm: neck ? parseFloat(neck) : null,
        right_upper_arm_cm: arm ? parseFloat(arm) : null,
        right_thigh_cm: thigh ? parseFloat(thigh) : null,
        body_fat_percent: bodyFat ? parseFloat(bodyFat) : null,
        resting_heart_rate: heartRate ? parseInt(heartRate) : null,
        photo_front: photoFront || null,
        photo_side: photoSide || null,
        photo_back: photoBack || null,
        notes: notes || null,
      });
      // Reset all fields except date
      setWeight("");
      setWaist("");
      setHip("");
      setChest("");
      setNeck("");
      setArm("");
      setThigh("");
      setBodyFat("");
      setHeartRate("");
      setPhotoFront("");
      setPhotoSide("");
      setPhotoBack("");
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
        Log weekly body metrics
      </h3>

      <div className="grid grid-cols-2 gap-3">
        <div className="col-span-2">
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
            value={chest}
            onChange={(e) => setChest(e.target.value)}
            className="w-full border border-rule bg-white/70 rounded-sm px-2 py-1.5 text-sm"
            placeholder="Optional"
          />
        </div>
        <div>
          <label className="block text-xs text-ink/60 mb-1">Neck (cm)</label>
          <input
            type="number"
            step="0.1"
            value={neck}
            onChange={(e) => setNeck(e.target.value)}
            className="w-full border border-rule bg-white/70 rounded-sm px-2 py-1.5 text-sm"
            placeholder="Optional"
          />
        </div>
        <div>
          <label className="block text-xs text-ink/60 mb-1">R. Upper Arm (cm)</label>
          <input
            type="number"
            step="0.1"
            value={arm}
            onChange={(e) => setArm(e.target.value)}
            className="w-full border border-rule bg-white/70 rounded-sm px-2 py-1.5 text-sm"
            placeholder="Optional"
          />
        </div>
        <div>
          <label className="block text-xs text-ink/60 mb-1">R. Thigh (cm)</label>
          <input
            type="number"
            step="0.1"
            value={thigh}
            onChange={(e) => setThigh(e.target.value)}
            className="w-full border border-rule bg-white/70 rounded-sm px-2 py-1.5 text-sm"
            placeholder="Optional"
          />
        </div>
        <div>
          <label className="block text-xs text-ink/60 mb-1">Body Fat (%)</label>
          <input
            type="number"
            step="0.1"
            value={bodyFat}
            onChange={(e) => setBodyFat(e.target.value)}
            className="w-full border border-rule bg-white/70 rounded-sm px-2 py-1.5 text-sm"
            placeholder="Optional"
          />
        </div>
        <div>
          <label className="block text-xs text-ink/60 mb-1">Resting Heart Rate</label>
          <input
            type="number"
            value={heartRate}
            onChange={(e) => setHeartRate(e.target.value)}
            className="w-full border border-rule bg-white/70 rounded-sm px-2 py-1.5 text-sm"
            placeholder="Optional"
          />
        </div>
        <div className="col-span-2">
          <label className="block text-xs text-ink/60 mb-1">Photo Front (URL)</label>
          <input
            type="text"
            value={photoFront}
            onChange={(e) => setPhotoFront(e.target.value)}
            className="w-full border border-rule bg-white/70 rounded-sm px-2 py-1.5 text-sm"
            placeholder="https://..."
          />
        </div>
        <div className="col-span-2">
          <label className="block text-xs text-ink/60 mb-1">Photo Side (URL)</label>
          <input
            type="text"
            value={photoSide}
            onChange={(e) => setPhotoSide(e.target.value)}
            className="w-full border border-rule bg-white/70 rounded-sm px-2 py-1.5 text-sm"
            placeholder="https://..."
          />
        </div>
        <div className="col-span-2">
          <label className="block text-xs text-ink/60 mb-1">Photo Back (URL)</label>
          <input
            type="text"
            value={photoBack}
            onChange={(e) => setPhotoBack(e.target.value)}
            className="w-full border border-rule bg-white/70 rounded-sm px-2 py-1.5 text-sm"
            placeholder="https://..."
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