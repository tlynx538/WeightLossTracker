"use client";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => void;
  onCancel: () => void; // for embarrassed
};

export default function DeleteConfirmModal({ isOpen, onClose, onConfirm, onCancel }: Props) {
  if (!isOpen) return null;

  const handleReason = (reason: string) => {
    if (reason === "embarrassed") {
      onCancel();
    } else {
      onConfirm(reason);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/40 backdrop-blur-sm">
      <div className="bg-white rounded-md shadow-xl w-full max-w-sm p-6">
        <h3 className="text-lg font-bold text-ink mb-2">Delete this entry?</h3>
        <p className="text-sm text-ink/60 mb-4">Why are you deleting it?</p>
        <div className="space-y-2">
          <button
            onClick={() => handleReason("instrumentation error")}
            className="w-full text-left text-sm bg-stone-50 hover:bg-stone-100 px-4 py-2 rounded-sm"
          >
            Instrumentation error
          </button>
          <button
            onClick={() => handleReason("accidental")}
            className="w-full text-left text-sm bg-stone-50 hover:bg-stone-100 px-4 py-2 rounded-sm"
          >
            Accidental log
          </button>
          <button
            onClick={() => handleReason("embarrassed")}
            className="w-full text-left text-sm bg-stone-50 hover:bg-stone-100 px-4 py-2 rounded-sm"
          >
            I&apos;m embarrassed (keep it)
          </button>
        </div>
        <button
          onClick={onClose}
          className="mt-4 text-sm text-ink/50 hover:text-ink w-full text-center"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}