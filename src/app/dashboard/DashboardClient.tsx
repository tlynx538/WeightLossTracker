"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Entry, DailyLog, NewEntry, NewDailyLog } from "@/lib/types";
import StatCards from "@/components/StatCards";
import TrendChart from "@/components/TrendChart";
import EntryForm from "@/components/EntryForm";
import EntryTable from "@/components/EntryTable";
import GoalWeight from "@/components/GoalWeight";
import DailyLogForm from "@/components/DailyLogForm";
import HabitScore from "@/components/HabitScore";
import HealthSystemScore from "@/components/HealthSystemScore";
import MovingAverageChart from "@/components/MovingAverageChart";
import CorrelationInsights from "@/components/CorrelationInsights";
import WeeklyReview from "@/components/WeeklyReview";
import WeightNoteModal from "@/components/WeightNoteModal";
import DeleteConfirmModal from "@/components/DeleteConfirmModal";
import GoalProgress from "@/components/GoalProgress";
import MilestoneModal from "@/components/MilestoneModal";

type Props = {
  userEmail: string;
  displayName: string | null;
  goalWeightKg: number | null;
  initialEntries: Entry[];
  initialDailyLogs: DailyLog[];
  heightCm: number | null;
  age: number | null;
};

export default function DashboardClient({
  userEmail,
  displayName,
  goalWeightKg: initialGoal,
  initialEntries,
  initialDailyLogs,
  heightCm,
  age,
}: Props) {
  const supabase = createClient();
  const router = useRouter();

  const [entries, setEntries] = useState<Entry[]>(initialEntries);
  const [dailyLogs, setDailyLogs] = useState<DailyLog[]>(initialDailyLogs);
  const [goalWeightKg, setGoalWeightKg] = useState<number | null>(initialGoal);

  // Layout State
  const [showEntryModal, setShowEntryModal] = useState(false);
  const [showLogModal, setShowLogModal] = useState(false);

  // Weight note modal state
  const [showWeightNoteModal, setShowWeightNoteModal] = useState(false);
  const [pendingNewEntry, setPendingNewEntry] = useState<Entry | null>(null);

  // Delete confirmation modal state
  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);

  // Milestone modal state
  const [showMilestoneModal, setShowMilestoneModal] = useState(false);
  const [milestoneWeight, setMilestoneWeight] = useState<number | null>(null);

  // --- Entry CRUD ---
  async function handleAddEntry(newEntry: NewEntry) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Not signed in.");

    const { data, error } = await supabase
      .from("entries")
      .insert({ ...newEntry, user_id: user.id })
      .select()
      .single();

    if (error) throw new Error(error.message);

    const entry = data as Entry;
    // Optimistically update UI
    setEntries((prev) => [...prev, entry]);

    // Check for weight anomaly (note prompt)
    const sorted = [...entries, entry].sort(
      (a, b) => new Date(a.entry_date).getTime() - new Date(b.entry_date).getTime()
    );
    const firstWeight = sorted[0]?.weight_kg;
    if (firstWeight !== undefined) {
      const weight = entry.weight_kg;
      const isHigher = weight > firstWeight;
      const isMajorLoss = firstWeight - weight > 2; // loss more than 2kg
      if (isHigher || isMajorLoss) {
        setPendingNewEntry(entry);
        setShowWeightNoteModal(true);
        // Keep entry modal open; will close after note or skip
        return;
      }
    }

    // Check for milestone
    checkAndCelebrateMilestone(entry);

    // No anomaly: close entry modal
    setShowEntryModal(false);
  }

  // Helper to check milestones and show celebration
  function checkAndCelebrateMilestone(entry: Entry) {
    if (!goalWeightKg || entries.length === 0) return;

    const sortedAll = [...entries, entry].sort(
      (a, b) => new Date(a.entry_date).getTime() - new Date(b.entry_date).getTime()
    );
    const firstWeight = sortedAll[0].weight_kg;
    const finalGoal = goalWeightKg;
    const isLosing = firstWeight > finalGoal;

    const step = 5;
    const milestones: number[] = [];
    if (isLosing) {
      for (let w = firstWeight - step; w >= finalGoal; w -= step) {
        milestones.push(w);
      }
    } else {
      for (let w = firstWeight + step; w <= finalGoal; w += step) {
        milestones.push(w);
      }
    }
    if (!milestones.includes(finalGoal)) milestones.push(finalGoal);
    milestones.sort((a, b) => a - b);

    // Check if this entry reaches a milestone that was not previously reached
    const previousEntries = entries.filter(e => e.id !== entry.id);
    const newlyReached = milestones.filter(m => {
      const currentReached = entry.weight_kg <= m; // for losing
      if (!currentReached) return false;
      // Check if any previous entry already reached this milestone
      const previouslyReached = previousEntries.some(e => e.weight_kg <= m);
      return !previouslyReached;
    });

    if (newlyReached.length > 0) {
      const latestReached = newlyReached[newlyReached.length - 1];
      setMilestoneWeight(latestReached);
      setShowMilestoneModal(true);
    }
  }

  async function handleWeightNoteSubmit(note: string) {
    if (!pendingNewEntry) return;
    const { error } = await supabase
      .from("entries")
      .update({ notes: note })
      .eq("id", pendingNewEntry.id);

    if (!error) {
      setEntries((prev) =>
        prev.map((e) => (e.id === pendingNewEntry.id ? { ...e, notes: note } : e))
      );
    }
    // Close modals
    setShowWeightNoteModal(false);
    setPendingNewEntry(null);
    setShowEntryModal(false);
  }

  async function handleDeleteEntry(id: string) {
    setPendingDeleteId(id);
    setShowDeleteConfirmModal(true);
  }

  async function handleDeleteConfirm(reason: string) {
    if (!pendingDeleteId) return;
    const previous = entries;
    setEntries((prev) => prev.filter((e) => e.id !== pendingDeleteId));
    const { error } = await supabase.from("entries").delete().eq("id", pendingDeleteId);
    if (error) {
      setEntries(previous);
    }
    setPendingDeleteId(null);
    setShowDeleteConfirmModal(false);
  }

  function handleDeleteCancel() {
    setPendingDeleteId(null);
    setShowDeleteConfirmModal(false);
  }

  async function handleSaveGoal(value: number | null) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    await supabase.from("profiles").update({ goal_weight_kg: value }).eq("id", user.id);
    setGoalWeightKg(value);
  }

  // --- Daily Log CRUD ---
  async function handleAddDailyLog(newLog: NewDailyLog) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Not signed in.");

    const existing = dailyLogs.find((l) => l.log_date === newLog.log_date);
    let result: DailyLog | undefined; // Explicitly typed
    if (existing) {
      const { data, error } = await supabase
        .from("daily_logs")
        .update({ ...newLog, updated_at: new Date().toISOString() })
        .eq("id", existing.id)
        .select()
        .single();
      if (error) throw new Error(error.message);
      result = data as DailyLog;
      setDailyLogs((prev) => prev.map((l) => (l.id === existing.id ? result! : l)));
    } else {
      const { data, error } = await supabase
        .from("daily_logs")
        .insert({ ...newLog, user_id: user.id })
        .select()
        .single();
      if (error) throw new Error(error.message);
      result = data as DailyLog;
      setDailyLogs((prev) => [...prev, result!]);
    }
    setShowLogModal(false);
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  const todayStr = new Date().toISOString().slice(0, 10);
  const todaysLog = dailyLogs.find((l) => l.log_date === todayStr) || null;

  return (
    <main className="min-h-screen max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-10 relative space-y-8 sm:space-y-12">
      
      {/* 1. Header & Global Actions */}
      <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between pb-6 border-b border-rule">
        <div>
          <p className="font-mono text-xs tracking-widest text-pine uppercase mb-1">
            Logbook
          </p>
          <h1 className="text-2xl font-bold text-ink">
            {displayName ? `${displayName}'s log` : "Your log"}
          </h1>
          <p className="text-xs text-ink/50 mt-1 break-all">{userEmail}</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-2">
          <button
            onClick={() => setShowLogModal(true)}
            className="w-full sm:w-auto text-xs font-mono bg-pine text-white hover:bg-pine/90 rounded-sm px-4 py-2 transition-colors"
          >
            + Daily Log
          </button>
          <button
            onClick={() => setShowEntryModal(true)}
            className="w-full sm:w-auto text-xs font-mono bg-ink text-white hover:bg-ink/90 rounded-sm px-4 py-2 transition-colors"
          >
            + Log Body Metrics
          </button>
          <Link
            href="/settings"
            className="w-full sm:w-auto text-xs font-mono text-ink/50 hover:text-pine border border-rule rounded-sm px-4 py-2 transition-colors text-center"
          >
            Settings
          </Link>
          <button
            onClick={handleLogout}
            className="w-full sm:w-auto text-xs font-mono text-ink/50 hover:text-rust border border-rule rounded-sm px-4 py-2 transition-colors"
          >
            Sign out
          </button>
        </div>
      </header>

      {/* 2. Overview & Goals */}
      <section className="space-y-4">
        <StatCards
          entries={entries}
          goalWeightKg={goalWeightKg}
          heightCm={heightCm}
          age={age}
        />
        <GoalWeight goalWeightKg={goalWeightKg} onSave={handleSaveGoal} />
      </section>

      {/* 3. Goal Progress */}
      <section className="space-y-4">
        <h2 className="text-lg font-bold text-ink">Goal Progress</h2>
        <GoalProgress
          entries={entries}
          goalWeightKg={goalWeightKg}
          heightCm={heightCm}
          age={age}
        />
      </section>

      {/* 4. Visual Trends */}
      <section className="space-y-4">
        <h2 className="text-lg font-bold text-ink">Weight Trend</h2>
        <MovingAverageChart entries={entries} />
      </section>

      {/* 5. Today's Pulse */}
      <section className="space-y-4">
        <h2 className="text-lg font-bold text-ink">Today's Pulse</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <HabitScore log={todaysLog} />
          <HealthSystemScore log={todaysLog} />
        </div>
      </section>

      {/* 6. Insights & Review */}
      <section className="space-y-4">
        <h2 className="text-lg font-bold text-ink">Insights & Review</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <CorrelationInsights logs={dailyLogs} />
          <WeeklyReview logs={dailyLogs} entries={entries} />
        </div>
      </section>

      {/* 7. Overall Progress */}
      <section className="space-y-4">
        <h2 className="text-lg font-bold text-ink">Overall Progress</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <TrendChart entries={entries} dataKey="weight_kg" label="Weight" unit="kg" color="#2F6F62" />
          <TrendChart entries={entries} dataKey="waist_cm" label="Waist" unit="cm" color="#B8860B" />
          <TrendChart entries={entries} dataKey="hip_cm" label="Hip" unit="cm" color="#B5453C" />
          <TrendChart entries={entries} dataKey="chest_cm" label="Chest" unit="cm" color="#1F4A41" />
        </div>
      </section>

      {/* 8. Raw Data */}
      <section className="space-y-4 pb-10">
        <h2 className="text-lg font-bold text-ink">Log History</h2>
        <EntryTable entries={entries} onDelete={handleDeleteEntry} />
      </section>

      {/* -------------------- MODALS -------------------- */}

      {/* Daily Log Modal */}
      {showLogModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-ink/40 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-md shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto relative p-6 sm:p-8">
            <button 
              onClick={() => setShowLogModal(false)}
              className="absolute top-4 right-5 text-ink/50 hover:text-ink text-2xl leading-none font-bold"
              aria-label="Close"
            >
              &times;
            </button>
            <h2 className="text-xl font-bold text-ink mb-6 pr-6">Log Your Day</h2>
            <DailyLogForm existingLogs={dailyLogs} onSubmit={handleAddDailyLog} />
          </div>
        </div>
      )}

      {/* Body Metrics Modal */}
      {showEntryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-ink/40 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-md shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto relative p-6 sm:p-8">
            <button 
              onClick={() => setShowEntryModal(false)}
              className="absolute top-4 right-5 text-ink/50 hover:text-ink text-2xl leading-none font-bold"
              aria-label="Close"
            >
              &times;
            </button>
            <h2 className="text-xl font-bold text-ink mb-6 pr-6">Log Body Metrics</h2>
            <EntryForm onSubmit={handleAddEntry} />
          </div>
        </div>
      )}

      {/* Weight Note Modal */}
      <WeightNoteModal
        isOpen={showWeightNoteModal}
        entry={
          pendingNewEntry
            ? {
                date: pendingNewEntry.entry_date,
                weight: pendingNewEntry.weight_kg,
                initialWeight: entries.length > 0 ? entries[0].weight_kg : undefined,
              }
            : null
        }
        onClose={() => {
          setShowWeightNoteModal(false);
          setPendingNewEntry(null);
          setShowEntryModal(false);
        }}
        onSubmit={handleWeightNoteSubmit}
      />

      {/* Delete Confirm Modal */}
      <DeleteConfirmModal
        isOpen={showDeleteConfirmModal}
        onClose={() => {
          setShowDeleteConfirmModal(false);
          setPendingDeleteId(null);
        }}
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
      />

      {/* Milestone Modal */}
      <MilestoneModal
        isOpen={showMilestoneModal}
        milestoneWeight={milestoneWeight ?? 0}
        onClose={() => setShowMilestoneModal(false)}
      />
    </main>
  );
}