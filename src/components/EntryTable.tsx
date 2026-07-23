"use client";

import { useState } from "react";
import { Entry } from "@/lib/types";

type Props = {
  entries: Entry[];
  onDelete: (id: string) => Promise<void>;
};

export default function EntryTable({ entries, onDelete }: Props) {
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const sorted = [...entries].sort(
    (a, b) => new Date(b.entry_date).getTime() - new Date(a.entry_date).getTime()
  );

  const handleDelete = async (id: string) => {
    try {
      setDeletingId(id);
      await onDelete(id);
    } finally {
      setDeletingId(null);
    }
  };

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString("en-US", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
    });

  const hasNote = (entry: Entry) => entry.notes && entry.notes.trim().length > 0;

  return (
    <div className="border border-rule rounded-md bg-white overflow-hidden shadow-sm">
      {/* Header */}
      <div className="p-5 border-b border-rule bg-stone-50/30 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-ink">Entry History</h3>
          <p className="text-xs text-ink/60 mt-0.5">Chronological log of body measurements and notes</p>
        </div>
        <span className="font-mono text-xs text-ink/50 bg-stone-100 px-2 py-1 rounded-sm">
          {sorted.length} {sorted.length === 1 ? "entry" : "entries"}
        </span>
      </div>

      {/* Empty state */}
      {sorted.length === 0 && (
        <div className="p-12 text-center text-ink/50 text-sm">
          No entries logged yet. Start by logging your weight.
        </div>
      )}

      {/* Chronological List Layout */}
      <div className="divide-y divide-rule">
        {sorted.map((entry) => {
          const hasNoteText = hasNote(entry);
          return (
            <div
              key={entry.id}
              className={`p-5 transition-colors flex flex-col gap-3 ${
                hasNoteText ? "bg-amber-50/15" : "bg-white hover:bg-stone-50/30"
              }`}
            >
              {/* Main Row Content */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                {/* Left Side: Date & Core Weight/Metrics */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-8">
                  {/* Date */}
                  <div className="w-36 shrink-0">
                    <span className="text-xs font-mono text-ink/60 font-medium">
                      {formatDate(entry.entry_date)}
                    </span>
                  </div>

                  {/* Weight */}
                  <div className="flex items-baseline gap-1.5 w-24 shrink-0">
                    <span className="text-xl font-bold text-ink">
                      {entry.weight_kg}
                    </span>
                    <span className="text-xs text-ink/50 font-mono">kg</span>
                  </div>

                  {/* Other Measurements */}
                  <div className="flex flex-wrap items-center gap-3 text-xs text-ink/70">
                    {entry.waist_cm !== null && entry.waist_cm !== undefined && (
                      <span>
                        Waist: <strong className="font-mono text-ink">{entry.waist_cm}</strong> cm
                      </span>
                    )}
                    {entry.hip_cm !== null && entry.hip_cm !== undefined && (
                      <span>
                        Hip: <strong className="font-mono text-ink">{entry.hip_cm}</strong> cm
                      </span>
                    )}
                    {entry.chest_cm !== null && entry.chest_cm !== undefined && (
                      <span>
                        Chest: <strong className="font-mono text-ink">{entry.chest_cm}</strong> cm
                      </span>
                    )}
                  </div>
                </div>

                {/* Right Side: Delete Action */}
                <div className="flex items-center justify-end md:justify-start shrink-0">
                  <button
                    onClick={() => handleDelete(entry.id)}
                    disabled={deletingId === entry.id}
                    className="text-xs text-rust/70 hover:text-rust transition-colors font-medium px-2 py-1"
                    aria-label="Delete entry"
                  >
                    {deletingId === entry.id ? "Deleting..." : "Delete"}
                  </button>
                </div>
              </div>

              {/* Polished Note Display Row (Full Width Below) */}
              {hasNoteText && (
                <div className="mt-1 ml-0 sm:ml-36 pl-3 border-l-2 border-amber-400 bg-amber-50/60 py-2 pr-3 rounded-r-md flex items-start gap-2.5 max-w-2xl">
                  <span className="text-xs text-amber-600 mt-0.5 select-none">💬</span>
                  <div className="flex-1">
                    <span className="font-mono text-[10px] uppercase tracking-wider text-amber-800/70 block mb-0.5">
                      Notable Change Note
                    </span>
                    <p className="text-xs text-ink/80 italic leading-relaxed">
                      &ldquo;{entry.notes}&rdquo;
                    </p>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}