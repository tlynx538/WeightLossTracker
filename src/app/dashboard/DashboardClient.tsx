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

// Helper to format date
const formatDate = (dateStr: string) =>
  new Date(dateStr).toLocaleDateString("en-US", {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
  });

// Component to render a single daily log card
function DailyLogCard({ log, weight }: { log: DailyLog; weight: number | null }) {
  return (
    <div className="border border-rule rounded-md bg-white p-5 space-y-3 shadow-sm hover:shadow-md transition-shadow">
      {/* Date and Weight */}
      <div className="flex items-center justify-between border-b border-rule pb-3">
        <h3 className="font-mono text-sm font-bold text-ink">
          {formatDate(log.log_date)}
        </h3>
        <div className="text-right">
          {weight !== null ? (
            <span className="text-lg font-bold text-pine">{weight} kg</span>
          ) : (
            <span className="text-xs text-ink/40">No weight logged</span>
          )}
        </div>
      </div>

      {/* Sleep */}
      {(log.sleep_hours !== null || log.sleep_quality !== null || log.bedtime || log.wake_time) && (
        <div>
          <p className="text-[10px] uppercase tracking-wider text-ink/50 font-mono mb-1">Sleep</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-1 text-sm">
            {log.sleep_hours !== null && <span>🕐 {log.sleep_hours}h</span>}
            {log.sleep_quality !== null && <span>⭐ Quality: {log.sleep_quality}/10</span>}
            {log.bedtime && <span>🌙 Bed: {log.bedtime}</span>}
            {log.wake_time && <span>☀️ Wake: {log.wake_time}</span>}
          </div>
        </div>
      )}

      {/* Hydration, Mood, Energy, Stress, Focus */}
      {(log.water_l !== null || log.mood !== null || log.energy !== null || log.stress !== null || log.focus !== null) && (
        <div>
          <p className="text-[10px] uppercase tracking-wider text-ink/50 font-mono mb-1">State</p>
          <div className="flex flex-wrap gap-3 text-sm">
            {log.water_l !== null && <span>💧 Water: {log.water_l}L</span>}
            {log.mood !== null && <span>😊 Mood: {log.mood}/10</span>}
            {log.energy !== null && <span>⚡ Energy: {log.energy}/10</span>}
            {log.stress !== null && <span>😰 Stress: {log.stress}/10</span>}
            {log.focus !== null && <span>🎯 Focus: {log.focus}/10</span>}
          </div>
        </div>
      )}

      {/* Digestion */}
      {(log.digestion_rating !== null || log.constipation || log.diarrhea || log.bloating || log.acid_reflux) && (
        <div>
          <p className="text-[10px] uppercase tracking-wider text-ink/50 font-mono mb-1">Digestion</p>
          <div className="flex flex-wrap gap-3 text-sm">
            {log.digestion_rating !== null && <span> digestion: {log.digestion_rating}/10</span>}
            {log.constipation && <span>🚫 Constipation</span>}
            {log.diarrhea && <span>💩 Diarrhea</span>}
            {log.bloating && <span>🎈 Bloating</span>}
            {log.acid_reflux && <span>🔥 Acid reflux</span>}
          </div>
        </div>
      )}

      {/* Nutrition */}
      {(log.breakfast || log.lunch || log.dinner || log.snacks || log.fruit_servings !== null || log.veg_servings !== null) && (
        <div>
          <p className="text-[10px] uppercase tracking-wider text-ink/50 font-mono mb-1">Nutrition</p>
          <div className="space-y-1 text-sm">
            {log.breakfast && <div>🥣 Breakfast: {log.breakfast}</div>}
            {log.lunch && <div>🥗 Lunch: {log.lunch}</div>}
            {log.dinner && <div>🍽️ Dinner: {log.dinner}</div>}
            {log.snacks && <div>🍿 Snacks: {log.snacks}</div>}
            <div className="flex flex-wrap gap-3">
              {log.fruit_servings !== null && <span>🍎 Fruit: {log.fruit_servings} serv</span>}
              {log.veg_servings !== null && <span>🥦 Veg: {log.veg_servings} serv</span>}
              {log.restaurant_meal && <span>🍔 Restaurant meal</span>}
              {log.protein_target_met && <span>💪 Protein goal met</span>}
            </div>
          </div>
        </div>
      )}

      {/* Training */}
      {(log.workout_today || log.workout_type || log.workout_duration_min !== null || log.cardio_duration_min !== null || log.steps !== null || log.pain_today !== null) && (
        <div>
          <p className="text-[10px] uppercase tracking-wider text-ink/50 font-mono mb-1">Training</p>
          <div className="flex flex-wrap gap-3 text-sm">
            {log.workout_today && <span>🏋️ Workout: {log.workout_type || "General"}</span>}
            {log.workout_duration_min !== null && <span>⏱️ Duration: {log.workout_duration_min} min</span>}
            {log.cardio_duration_min !== null && <span>🏃 Cardio: {log.cardio_duration_min} min</span>}
            {log.steps !== null && <span>👣 Steps: {log.steps}</span>}
            {log.pain_today !== null && <span>💢 Pain: {log.pain_today}/10</span>}
          </div>
        </div>
      )}

      {/* Habits */}
      {(
        log.habit_protein_breakfast ||
        log.habit_meal_prepped ||
        log.habit_water_goal ||
        log.habit_workout ||
        log.habit_no_delivery ||
        log.habit_logged_food
      ) && (
        <div>
          <p className="text-[10px] uppercase tracking-wider text-ink/50 font-mono mb-1">Habits</p>
          <div className="flex flex-wrap gap-2">
            {log.habit_protein_breakfast && <span className="text-xs bg-pine/10 text-pine px-2 py-0.5 rounded-full">✅ Protein breakfast</span>}
            {log.habit_meal_prepped && <span className="text-xs bg-pine/10 text-pine px-2 py-0.5 rounded-full">✅ Meal prepped</span>}
            {log.habit_water_goal && <span className="text-xs bg-pine/10 text-pine px-2 py-0.5 rounded-full">✅ Water goal</span>}
            {log.habit_workout && <span className="text-xs bg-pine/10 text-pine px-2 py-0.5 rounded-full">✅ Workout done</span>}
            {log.habit_no_delivery && <span className="text-xs bg-pine/10 text-pine px-2 py-0.5 rounded-full">✅ No delivery</span>}
            {log.habit_logged_food && <span className="text-xs bg-pine/10 text-pine px-2 py-0.5 rounded-full">✅ Food logged</span>}
          </div>
        </div>
      )}

      {/* Notes */}
      {log.notes && (
        <div className="pt-2 border-t border-rule/50">
          <p className="text-xs text-ink/70 italic">📝 {log.notes}</p>
        </div>
      )}
    </div>
  );
}

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

  // Tab state
  const [activeTab, setActiveTab] = useState<"dashboard" | "history">("dashboard");

  // Layout State (modals)
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
    setEntries((prev) => [...prev, entry]);

    // Check for weight anomaly
    const sorted = [...entries, entry].sort(
      (a, b) => new Date(a.entry_date).getTime() - new Date(b.entry_date).getTime()
    );
    const firstWeight = sorted[0]?.weight_kg;
    if (firstWeight !== undefined) {
      const weight = entry.weight_kg;
      const isHigher = weight > firstWeight;
      const isMajorLoss = firstWeight - weight > 2;
      if (isHigher || isMajorLoss) {
        setPendingNewEntry(entry);
        setShowWeightNoteModal(true);
        return;
      }
    }

    checkAndCelebrateMilestone(entry);
    setShowEntryModal(false);
  }

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

    const previousEntries = entries.filter(e => e.id !== entry.id);
    const newlyReached = milestones.filter(m => {
      const currentReached = entry.weight_kg <= m;
      if (!currentReached) return false;
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
    if (!user) {
      throw new Error("You must be signed in to log data.");
    }

    const existing = dailyLogs.find((l) => l.log_date === newLog.log_date);
    let result: DailyLog | undefined;
    try {
      if (existing) {
        const { data, error } = await supabase
          .from("daily_logs")
          .update({ ...newLog, updated_at: new Date().toISOString() })
          .eq("id", existing.id)
          .select()
          .single();
        if (error) throw error;
        result = data as DailyLog;
        setDailyLogs((prev) => prev.map((l) => (l.id === existing.id ? result! : l)));
      } else {
        const { data, error } = await supabase
          .from("daily_logs")
          .insert({ ...newLog, user_id: user.id })
          .select()
          .single();
        if (error) throw error;
        result = data as DailyLog;
        setDailyLogs((prev) => [...prev, result!]);
      }
      setShowLogModal(false);
    } catch (err: any) {
      alert(`Failed to save daily log: ${err.message}`);
      throw err;
    }
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  const todayStr = new Date().toISOString().slice(0, 10);
  const todaysLog = dailyLogs.find((l) => l.log_date === todayStr) || null;

  // Map entries by date for quick weight lookup
  const weightMap = new Map<string, number>();
  entries.forEach((e) => {
    weightMap.set(e.entry_date, e.weight_kg);
  });

  return (
    <main className="min-h-screen max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-10 relative space-y-8 sm:space-y-12">
      
      {/* Header with Cleaner Segmented Navigation */}
      <header className="flex flex-col gap-6 pb-6 border-b border-rule">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div>
            <p className="font-mono text-xs tracking-widest text-pine uppercase mb-1">
              Logbook
            </p>
            <h1 className="text-2xl font-bold text-ink">
              {displayName ? `${displayName}'s log` : "Your log"}
            </h1>
            <p className="text-xs text-ink/50 mt-1 break-all">{userEmail}</p>
          </div>

          {/* Secondary Actions (Settings & Sign Out) */}
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <Link
              href="/settings"
              className="text-xs font-mono text-ink/60 hover:text-pine border border-rule bg-white rounded-sm px-3 py-1.5 transition-colors"
            >
              Settings
            </Link>
            <button
              onClick={handleLogout}
              className="text-xs font-mono text-ink/60 hover:text-rust border border-rule bg-white rounded-sm px-3 py-1.5 transition-colors"
            >
              Sign out
            </button>
          </div>
        </div>

        {/* Cleaner Tab Navigation & Primary Action Toolbar */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-stone-50/50 p-2 rounded-md border border-rule">
          {/* Segmented Switcher */}
          <div className="flex items-center gap-1 bg-stone-200/60 p-1 rounded-sm w-full sm:w-auto">
            <button
              onClick={() => setActiveTab("dashboard")}
              className={`flex-1 sm:flex-none text-xs font-mono px-4 py-1.5 rounded-sm transition-all ${
                activeTab === "dashboard"
                  ? "bg-white text-ink font-medium shadow-xs"
                  : "text-ink/60 hover:text-ink"
              }`}
            >
              Dashboard
            </button>
            <button
              onClick={() => setActiveTab("history")}
              className={`flex-1 sm:flex-none text-xs font-mono px-4 py-1.5 rounded-sm transition-all ${
                activeTab === "history"
                  ? "bg-white text-ink font-medium shadow-xs"
                  : "text-ink/60 hover:text-ink"
              }`}
            >
              History
            </button>
          </div>

          {/* Contextual Action Buttons */}
          {activeTab === "dashboard" && (
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                onClick={() => setShowLogModal(true)}
                className="flex-1 sm:flex-none text-xs font-mono bg-pine text-white hover:bg-pine/90 rounded-sm px-4 py-2 transition-colors font-medium shadow-xs"
              >
                + Daily Log
              </button>
              <button
                onClick={() => setShowEntryModal(true)}
                className="flex-1 sm:flex-none text-xs font-mono bg-ink text-white hover:bg-ink/90 rounded-sm px-4 py-2 transition-colors font-medium shadow-xs"
              >
                + Log Body Metrics
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Tab Content */}
      {activeTab === "dashboard" ? (
        <>
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
        </>
      ) : (
        /* History Tab */
        <section className="space-y-4 pb-10">
          <h2 className="text-lg font-bold text-ink">Daily Log History</h2>
          {dailyLogs.length === 0 ? (
            <div className="text-center text-ink/50 py-12">
              No daily logs yet. Start logging your daily health to see history here.
            </div>
          ) : (
            <div className="space-y-4">
              {dailyLogs.map((log) => (
                <DailyLogCard
                  key={log.id}
                  log={log}
                  weight={weightMap.get(log.log_date) || null}
                />
              ))}
            </div>
          )}
        </section>
      )}

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