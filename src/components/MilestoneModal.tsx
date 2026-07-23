// src/components/MilestoneModal.tsx (already correct)
"use client";

type Props = {
  isOpen: boolean;
  milestoneWeight: number;
  onClose: () => void;
};

export default function MilestoneModal({ isOpen, milestoneWeight, onClose }: Props) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/40 backdrop-blur-sm">
      <div className="bg-white rounded-md shadow-xl w-full max-w-sm p-6 text-center">
        <div className="text-4xl mb-2">🎉</div>
        <h3 className="text-xl font-bold text-ink mb-1">Milestone Reached!</h3>
        <p className="text-sm text-ink/60 mb-4">
          You've reached <span className="font-bold text-pine">{milestoneWeight} kg</span>!
        </p>
        <p className="text-xs text-ink/50 mb-4">Keep up the great work.</p>
        <button
          onClick={onClose}
          className="bg-pine text-white text-sm font-medium rounded-sm px-6 py-2 hover:bg-pine/90"
        >
          Awesome!
        </button>
      </div>
    </div>
  );
}