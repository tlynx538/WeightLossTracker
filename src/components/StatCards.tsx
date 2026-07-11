"use client";

import { Entry } from "@/lib/types";

type Props = {
  entries: Entry[];
  goalWeightKg: number | null;
};

function Stat({
  eyebrow,
  value,
  sub,
  accent,
}: {
  eyebrow: string;
  value: string;
  sub?: string;
  accent?: "pine" | "rust" | "ochre";
}) {
  const accentClass =
    accent === "rust" ? "text-rust" : accent === "ochre" ? "text-ochre" : "text-pine";

  return (
    <div className="card p-4">
      <p className="font-mono text-[11px] uppercase tracking-wide text-ink/50 mb-1">
        {eyebrow}
      </p>
      <p className={`text-2xl font-display font-bold ${accentClass}`}>{value}</p>
      {sub && <p className="text-xs text-ink/50 mt-0.5">{sub}</p>}
    </div>
  );
}

export default function StatCards({ entries, goalWeightKg }: Props) {
  const sorted = [...entries].sort(
    (a, b) => new Date(a.entry_date).getTime() - new Date(b.entry_date).getTime()
  );

  const first = sorted[0];
  const latest = sorted[sorted.length - 1];

  const totalChange = first && latest ? latest.weight_kg - first.weight_kg : null;
  const toGoal =
    goalWeightKg && latest ? latest.weight_kg - goalWeightKg : null;

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
      <Stat
        eyebrow="Current weight"
        value={latest ? `${latest.weight_kg} kg` : "—"}
        sub={latest ? new Date(latest.entry_date).toLocaleDateString() : "No entries yet"}
      />
      <Stat
        eyebrow="Total change"
        value={
          totalChange !== null
            ? `${totalChange > 0 ? "+" : ""}${totalChange.toFixed(1)} kg`
            : "—"
        }
        sub={first ? `Since ${new Date(first.entry_date).toLocaleDateString()}` : undefined}
        accent={totalChange !== null ? (totalChange <= 0 ? "pine" : "rust") : undefined}
      />
      <Stat
        eyebrow="To goal"
        value={
          goalWeightKg
            ? toGoal !== null
              ? `${Math.abs(toGoal).toFixed(1)} kg ${toGoal > 0 ? "to lose" : "past goal"}`
              : "—"
            : "Not set"
        }
        accent="ochre"
      />
    </div>
  );
}
