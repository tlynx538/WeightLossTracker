"use client";

import { useState } from "react";

type Props = {
  isOpen: boolean;
  entry: { date: string; weight: number; initialWeight?: number } | null;
  onClose: () => void;
  onSubmit: (note: string) => void;
};

export default function WeightNoteModal({ isOpen, entry, onClose, onSubmit }: Props) {
  const [note, setNote] = useState("");

  if (!isOpen || !entry) return null;

  const isHigher = entry.initialWeight !== undefined && entry.weight > entry.initialWeight;
  const isMajorLoss = entry.initialWeight !== undefined && (entry.initialWeight - entry.weight) > 2;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/40 backdrop-blur-sm">
      <div className="bg-white rounded-md shadow-xl w-full max-w-md p-6">
        <h3 className="text-lg font-bold text-ink mb-2">Log a note for this weight</h3>
        <p className="text-sm text-ink/60 mb-4">
          Your weight is {entry.weight} kg.
          {entry.initialWeight !== undefined && (
            <>
              {isHigher && ` It's higher than your initial weight (${entry.initialWeight} kg).`}
              {isMajorLoss && ` It's significantly lower than your initial weight (${entry.initialWeight} kg).`}
            </>
          )}
          <br />Please add a note explaining why this happened.
        </p>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            onSubmit(note);
            setNote("");
          }}
        >
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="w-full border border-rule rounded-sm px-3 py-2 text-sm mb-4"
            rows={3}
            placeholder="e.g., ate out, holiday, dehydration, etc."
            autoFocus
          />
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="text-sm text-ink/50 hover:text-ink"
            >
              Skip
            </button>
            <button
              type="submit"
              className="bg-pine text-white text-sm font-medium rounded-sm px-4 py-2"
            >
              Save note
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}