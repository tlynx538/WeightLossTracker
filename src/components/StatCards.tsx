"use client";

import { Entry } from "@/lib/types";

type Props = {
  entries: Entry[];
  goalWeightKg: number | null;
  heightCm: number | null;
  age: number | null; // not used directly, but kept for future
};

// Helper for a clean, unified date format
const formatDate = (dateStr: string) =>
  new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

// Unified Stat Box component
function StatBox({
  eyebrow,
  value,
  sub,
  valueColor = "text-ink",
}: {
  eyebrow: string;
  value: React.ReactNode;
  sub?: string;
  valueColor?: string;
}) {
  return (
    <div className="p-5 md:px-6 flex flex-col justify-center bg-white">
      <p className="font-mono text-[10px] uppercase tracking-wider text-ink/50 mb-1.5">
        {eyebrow}
      </p>
      <p className={`text-3xl font-semibold tracking-tight mb-1 ${valueColor}`}>
        {value}
      </p>
      <p className="text-xs text-ink/60 h-4">{sub}</p>
    </div>
  );
}

export default function StatCards({ entries, goalWeightKg, heightCm }: Props) {
  // Empty state
  if (!entries || entries.length === 0) {
    return (
      <div className="border border-rule rounded-md shadow-sm grid grid-cols-1 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-rule overflow-hidden">
        <StatBox eyebrow="Current weight" value="—" sub="No entries yet" />
        <StatBox eyebrow="Total change" value="—" />
        <StatBox eyebrow="Distance to goal" value="—" sub={goalWeightKg ? `Target: ${goalWeightKg} kg` : "Goal not set"} />
        <StatBox eyebrow="BMI" value="—" sub="Enter height in settings" />
      </div>
    );
  }

  const sorted = [...entries].sort(
    (a, b) => new Date(a.entry_date).getTime() - new Date(b.entry_date).getTime()
  );

  const first = sorted[0];
  const latest = sorted[sorted.length - 1];

  // Current Weight
  const currentWeight = `${latest.weight_kg.toFixed(1)} kg`;
  const currentSub = `As of ${formatDate(latest.entry_date)}`;

  // Total Change
  const totalChange = latest.weight_kg - first.weight_kg;
  const isLoss = totalChange < 0;
  const isGain = totalChange > 0;
  const changeValue = isLoss
    ? `↓ ${Math.abs(totalChange).toFixed(1)} kg`
    : isGain
      ? `↑ ${totalChange.toFixed(1)} kg`
      : "0.0 kg";
  const changeColor = isLoss ? "text-pine" : isGain ? "text-rust" : "text-ink";
  const changeSub = first.entry_date !== latest.entry_date
    ? `Since ${formatDate(first.entry_date)}`
    : "First weigh-in";

  // Distance to Goal
  let goalValue = "—";
  let goalColor = "text-ink";
  let goalSub = "Goal not set";
  if (goalWeightKg) {
    const toGoal = latest.weight_kg - goalWeightKg;
    goalSub = `Target: ${goalWeightKg} kg`;
    if (toGoal <= 0) {
      goalValue = "Goal met! 🎉";
      goalColor = "text-pine";
    } else {
      goalValue = `${toGoal.toFixed(1)} kg`;
    }
  }

  // BMI
  let bmi: number | null = null;
  let bmiCategory = "Enter height in settings";
  if (heightCm && heightCm > 0) {
    const heightM = heightCm / 100;
    bmi = latest.weight_kg / (heightM * heightM);
    if (bmi < 18.5) bmiCategory = "Underweight";
    else if (bmi < 25) bmiCategory = "Normal";
    else if (bmi < 30) bmiCategory = "Overweight";
    else bmiCategory = "Obese";
  }

  return (
    <div className="border border-rule rounded-md shadow-sm grid grid-cols-1 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-rule overflow-hidden">
      <StatBox eyebrow="Current Weight" value={currentWeight} sub={currentSub} />
      <StatBox
        eyebrow="Total Change"
        value={changeValue}
        sub={changeSub}
        valueColor={changeColor}
      />
      <StatBox
        eyebrow="Distance to Goal"
        value={goalValue}
        sub={goalSub}
        valueColor={goalColor}
      />
      <StatBox
        eyebrow="BMI"
        value={bmi !== null ? bmi.toFixed(1) : "—"}
        sub={bmiCategory}
      />
    </div>
  );
}