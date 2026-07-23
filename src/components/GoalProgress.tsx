"use client";

import { Entry } from "@/lib/types";
import { useState } from "react";

type Props = {
  entries: Entry[];
  goalWeightKg: number | null;
  heightCm: number | null;
  age: number | null;
};

// Helper: compute recommended weight for BMI 22
function getRecommendedWeight(heightCm: number): number | null {
  if (!heightCm || heightCm <= 0) return null;
  const heightM = heightCm / 100;
  return 22 * heightM * heightM;
}

// Helper: BMI category
function getBMICategory(bmi: number): string {
  if (bmi < 18.5) return "Underweight";
  if (bmi < 25) return "Normal";
  if (bmi < 30) return "Overweight";
  return "Obese";
}

// Tooltip component – uses <span> instead of <div> to avoid nesting issues
function InfoTooltip({ text }: { text: string }) {
  const [visible, setVisible] = useState(false);

  return (
    <span
      className="relative inline-flex items-center ml-1"
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
    >
      <span className="text-ink/40 hover:text-ink/70 cursor-help text-sm">ⓘ</span>
      {visible && (
        <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-2 bg-ink text-white text-xs rounded-md shadow-md z-10 text-center">
          {text}
          <span className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-ink" />
        </span>
      )}
    </span>
  );
}

export default function GoalProgress({ entries, goalWeightKg, heightCm, age }: Props) {
  if (!entries || entries.length === 0) {
    return (
      <div className="border border-rule rounded-md p-4 bg-stone-50/50 text-center text-ink/50">
        Log at least one weight to see your goal progress.
      </div>
    );
  }

  const sorted = [...entries].sort(
    (a, b) => new Date(a.entry_date).getTime() - new Date(b.entry_date).getTime()
  );
  const firstWeight = sorted[0].weight_kg;
  const currentWeight = sorted[sorted.length - 1].weight_kg;

  // Determine final goal: use user‑set goal if available, otherwise use recommended BMI goal.
  let finalGoal = goalWeightKg;
  let recommendedGoal: number | null = null;
  let usingRecommended = false;

  if (heightCm && heightCm > 0) {
    recommendedGoal = getRecommendedWeight(heightCm);
    if (recommendedGoal) {
      if (!goalWeightKg) {
        finalGoal = recommendedGoal;
        usingRecommended = true;
      }
    }
  }

  // If still no goal, cannot proceed.
  if (!finalGoal) {
    return (
      <div className="border border-rule rounded-md p-4 bg-stone-50/50 text-center text-ink/50">
        Set a goal weight or enter your height to get a recommended goal.
      </div>
    );
  }

  const isLosing = firstWeight > finalGoal;
  const totalChange = Math.abs(firstWeight - finalGoal);

  // Generate adaptive milestones
  const getMilestones = () => {
    if (totalChange < 1) return [];

    let numMilestones = Math.min(10, Math.max(3, Math.ceil(totalChange / 2.5)));
    let step = totalChange / numMilestones;
    step = Math.min(5, Math.max(1, step));
    step = Math.round(step * 2) / 2;

    const milestones: number[] = [];
    let current = firstWeight;
    if (isLosing) {
      while (current - step > finalGoal + 0.5) {
        current = current - step;
        milestones.push(Math.round(current * 10) / 10);
      }
      if (!milestones.includes(finalGoal)) {
        milestones.push(finalGoal);
      }
    } else {
      while (current + step < finalGoal - 0.5) {
        current = current + step;
        milestones.push(Math.round(current * 10) / 10);
      }
      if (!milestones.includes(finalGoal)) {
        milestones.push(finalGoal);
      }
    }
    return milestones;
  };

  const milestones = getMilestones();
  const achieved = milestones.filter(m => isLosing ? currentWeight <= m : currentWeight >= m);
  const nextMilestone = milestones.find(m => !achieved.includes(m));

  const totalRange = totalChange;
  const currentProgress = Math.abs(currentWeight - firstWeight);
  const progressPercent = totalRange > 0 ? Math.min(100, (currentProgress / totalRange) * 100) : 0;

  let bmi: number | null = null;
  if (heightCm && heightCm > 0) {
    const heightM = heightCm / 100;
    bmi = currentWeight / (heightM * heightM);
  }

  const milestoneTooltip =
    "Milestones are generated dynamically based on your total weight change. " +
    "Step sizes adapt to your progress, typically 1–5 kg intervals, " +
    "with 3–10 intermediate goals to keep you motivated.";

  return (
    <div className="border border-rule rounded-md bg-white overflow-hidden shadow-sm">
      <div className="p-5 bg-stone-50/30 border-b border-rule">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h3 className="text-sm font-bold text-ink">Goal Progress</h3>
            <p className="text-xs text-ink/60">
              {isLosing ? "Losing" : "Gaining"} from {firstWeight} kg toward {finalGoal} kg
            </p>
          </div>
          {usingRecommended && (
            <span className="text-xs bg-pine/10 text-pine px-2 py-1 rounded-sm">
              Recommended goal
            </span>
          )}
          {recommendedGoal && !usingRecommended && (
            <span className="text-xs text-ink/50">
              Suggested: {recommendedGoal.toFixed(1)} kg (BMI 22)
            </span>
          )}
        </div>
      </div>

      <div className="p-5 space-y-5">
        {/* Progress Bar */}
        <div>
          <div className="flex justify-between text-xs text-ink/60 mb-1">
            <span>{firstWeight} kg</span>
            <span>{finalGoal} kg</span>
          </div>
          <div className="w-full h-3 bg-stone-100 rounded-full overflow-hidden relative">
            <div
              className="h-full bg-pine transition-all duration-500"
              style={{ width: `${Math.min(100, progressPercent)}%` }}
            />
            {milestones.map((m) => {
              const pos = ((Math.abs(m - firstWeight)) / totalRange) * 100;
              return (
                <div
                  key={m}
                  className="absolute top-0 h-full w-0.5 bg-white/60"
                  style={{ left: `${pos}%` }}
                />
              );
            })}
          </div>
          <div className="flex justify-between mt-1 text-[10px] text-ink/40 font-mono">
            {milestones.slice(0, 5).map((m) => (
              <span key={m}>{m}</span>
            ))}
            {milestones.length > 5 && <span>…</span>}
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
          <div>
            <p className="text-[10px] uppercase tracking-wider text-ink/50 font-mono">Current</p>
            <p className="text-xl font-bold text-ink">{currentWeight.toFixed(1)} kg</p>
          </div>

          <div>
            <div className="text-[10px] uppercase tracking-wider text-ink/50 font-mono flex items-center">
              Next Milestone
              <InfoTooltip text={milestoneTooltip} />
            </div>
            <p className="text-xl font-bold text-ink">
              {nextMilestone ? `${nextMilestone.toFixed(1)} kg` : "🎉 Goal reached!"}
            </p>
          </div>

          <div>
            <p className="text-[10px] uppercase tracking-wider text-ink/50 font-mono">Goal</p>
            <p className="text-xl font-bold text-ink">{finalGoal.toFixed(1)} kg</p>
          </div>

          <div>
            <p className="text-[10px] uppercase tracking-wider text-ink/50 font-mono">BMI</p>
            <p className="text-xl font-bold text-ink">
              {bmi !== null ? `${bmi.toFixed(1)} (${getBMICategory(bmi)})` : "—"}
            </p>
          </div>

          {recommendedGoal && (
            <div>
              <p className="text-[10px] uppercase tracking-wider text-ink/50 font-mono">Optimal Goal</p>
              <p className="text-xl font-bold text-ink/70">
                {recommendedGoal.toFixed(1)} kg
                <span className="block text-[10px] font-normal text-ink/40">BMI 22</span>
              </p>
            </div>
          )}
        </div>

        {/* Achieved milestones */}
        {achieved.length > 0 && (
          <div>
            <p className="text-xs text-ink/60">Milestones achieved: {achieved.length}</p>
            <div className="flex flex-wrap gap-1 mt-1">
              {achieved.map((m) => (
                <span key={m} className="text-[10px] bg-pine/10 text-pine px-1.5 py-0.5 rounded-sm">
                  {m.toFixed(1)} kg
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}