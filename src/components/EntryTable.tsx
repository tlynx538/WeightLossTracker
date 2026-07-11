"use client";

import { Entry } from "@/lib/types";

type Props = {
  entries: Entry[];
  onDelete: (id: string) => Promise<void>;
};

export default function EntryTable({ entries, onDelete }: Props) {
  const sorted = [...entries].sort(
    (a, b) => new Date(b.entry_date).getTime() - new Date(a.entry_date).getTime()
  );

  return (
    <div className="card overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-rule font-mono text-xs uppercase tracking-wide text-ink/50">
            <th className="text-left px-4 py-2 font-medium">Date</th>
            <th className="text-right px-4 py-2 font-medium">Weight</th>
            <th className="text-right px-4 py-2 font-medium">Waist</th>
            <th className="text-right px-4 py-2 font-medium">Hip</th>
            <th className="text-right px-4 py-2 font-medium">Chest</th>
            <th className="px-4 py-2"></th>
          </tr>
        </thead>
        <tbody>
          {sorted.length === 0 && (
            <tr>
              <td colSpan={6} className="text-center px-4 py-8 text-ink/50">
                No entries logged yet.
              </td>
            </tr>
          )}
          {sorted.map((entry) => (
            <tr key={entry.id} className="border-b border-rule/60 last:border-0">
              <td className="px-4 py-2 font-mono text-xs text-ink/70">
                {new Date(entry.entry_date).toLocaleDateString(undefined, {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })}
              </td>
              <td className="px-4 py-2 text-right font-mono">{entry.weight_kg} kg</td>
              <td className="px-4 py-2 text-right font-mono text-ink/70">
                {entry.waist_cm ?? "—"}
              </td>
              <td className="px-4 py-2 text-right font-mono text-ink/70">
                {entry.hip_cm ?? "—"}
              </td>
              <td className="px-4 py-2 text-right font-mono text-ink/70">
                {entry.chest_cm ?? "—"}
              </td>
              <td className="px-4 py-2 text-right">
                <button
                  onClick={() => onDelete(entry.id)}
                  className="text-xs text-rust/70 hover:text-rust hover:underline"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
