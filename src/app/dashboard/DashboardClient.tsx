"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Entry, NewEntry } from "@/lib/types";
import StatCards from "@/components/StatCards";
import TrendChart from "@/components/TrendChart";
import EntryForm from "@/components/EntryForm";
import EntryTable from "@/components/EntryTable";
import GoalWeight from "@/components/GoalWeight";

type Props = {
  userEmail: string;
  displayName: string | null;
  goalWeightKg: number | null;
  initialEntries: Entry[];
};

export default function DashboardClient({
  userEmail,
  displayName,
  goalWeightKg: initialGoal,
  initialEntries,
}: Props) {
  const supabase = createClient();
  const router = useRouter();

  const [entries, setEntries] = useState<Entry[]>(initialEntries);
  const [goalWeightKg, setGoalWeightKg] = useState<number | null>(initialGoal);

  async function handleAddEntry(newEntry: NewEntry) {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error("Not signed in.");

    const { data, error } = await supabase
      .from("entries")
      .insert({ ...newEntry, user_id: user.id })
      .select()
      .single();

    if (error) throw new Error(error.message);
    setEntries((prev) => [...prev, data as Entry]);
  }

  async function handleDeleteEntry(id: string) {
    const previous = entries;
    setEntries((prev) => prev.filter((e) => e.id !== id));
    const { error } = await supabase.from("entries").delete().eq("id", id);
    if (error) {
      setEntries(previous);
    }
  }

  async function handleSaveGoal(value: number | null) {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    await supabase
      .from("profiles")
      .update({ goal_weight_kg: value })
      .eq("id", user.id);

    setGoalWeightKg(value);
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <main className="min-h-screen max-w-4xl mx-auto px-6 py-10">
      <header className="flex items-start justify-between mb-6">
        <div>
          <p className="font-mono text-xs tracking-widest text-pine uppercase mb-1">
            Logbook
          </p>
          <h1 className="text-2xl font-bold text-ink">
            {displayName ? `${displayName}'s log` : "Your log"}
          </h1>
          <p className="text-xs text-ink/50 mt-1">{userEmail}</p>
        </div>
        <button
          onClick={handleLogout}
          className="text-xs font-mono text-ink/50 hover:text-rust border border-rule rounded-sm px-3 py-1.5"
        >
          Sign out
        </button>
      </header>

      <div className="tape-rule mb-6" />

      <div className="mb-6">
        <StatCards entries={entries} goalWeightKg={goalWeightKg} />
        <div className="mt-3">
          <GoalWeight goalWeightKg={goalWeightKg} onSave={handleSaveGoal} />
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4 mb-8">
        <TrendChart entries={entries} dataKey="weight_kg" label="Weight" unit="kg" color="#2F6F62" />
        <TrendChart entries={entries} dataKey="waist_cm" label="Waist" unit="cm" color="#B8860B" />
        <TrendChart entries={entries} dataKey="hip_cm" label="Hip" unit="cm" color="#B5453C" />
        <TrendChart entries={entries} dataKey="chest_cm" label="Chest" unit="cm" color="#1F4A41" />
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-1">
          <EntryForm onSubmit={handleAddEntry} />
        </div>
        <div className="md:col-span-2">
          <EntryTable entries={entries} onDelete={handleDeleteEntry} />
        </div>
      </div>
    </main>
  );
}
