"use client";

import { useState } from "react";

type Props = {
  goalWeightKg: number | null;
  onSave: (value: number | null) => Promise<void>;
};

export default function GoalWeight({ goalWeightKg, onSave }: Props) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(goalWeightKg?.toString() ?? "");
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    setSaving(true);
    const num = value ? parseFloat(value) : null;
    await onSave(num);
    setSaving(false);
    setEditing(false);
  }

  if (!editing) {
    return (
      <button
        onClick={() => setEditing(true)}
        className="text-xs font-mono text-ink/50 hover:text-pine underline underline-offset-2"
      >
        {goalWeightKg ? `Goal: ${goalWeightKg} kg — edit` : "Set a goal weight"}
      </button>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <input
        type="number"
        step="0.1"
        autoFocus
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Goal weight (kg)"
        className="border border-rule bg-white/70 rounded-sm px-2 py-1 text-xs w-32"
      />
      <button
        onClick={handleSave}
        disabled={saving}
        className="text-xs bg-pine text-white rounded-sm px-2 py-1"
      >
        {saving ? "…" : "Save"}
      </button>
      <button
        onClick={() => setEditing(false)}
        className="text-xs text-ink/50 hover:text-ink"
      >
        Cancel
      </button>
    </div>
  );
}
