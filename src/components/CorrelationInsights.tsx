"use client";

import { DailyLog } from "@/lib/types";

type Props = {
  logs: DailyLog[];
};

// Helper component to render a clean, comparative dual-bar insight
function InsightRow({
  title,
  labelA,
  valA,
  labelB,
  valB,
  highlightColor = "bg-pine",
  neutralColor = "bg-ink/20",
}: {
  title: string;
  labelA: string;
  valA: number;
  labelB: string;
  valB: number;
  highlightColor?: string;
  neutralColor?: string;
}) {
  const diff = valA - valB;
  const isPositive = diff > 0;
  
  // Determine which side is higher to write a natural language subtitle
  const higherLabel = isPositive ? labelA : labelB;
  const absDiff = Math.abs(diff);

  return (
    <div className="py-5 border-b border-rule last:border-0">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h4 className="text-sm font-bold text-ink">{title}</h4>
          <p className="text-xs text-ink/60 mt-0.5">
            Avg {absDiff.toFixed(1)} pts higher on <span className="font-medium text-ink">{higherLabel}</span> days
          </p>
        </div>
        
        {/* Highlight Pill */}
        <div className={`px-2 py-1 rounded-sm text-[10px] font-mono tracking-wide ${isPositive ? 'bg-pine/10 text-pine' : 'bg-rust/10 text-rust'}`}>
          {isPositive ? '+' : '-'}{absDiff.toFixed(1)} {isPositive ? labelA : labelB}
        </div>
      </div>

      <div className="space-y-2.5">
        {/* Condition A */}
        <div className="flex items-center gap-3 text-xs">
          <div className="w-24 shrink-0 text-ink/70 truncate">{labelA}</div>
          <div className="flex-1 h-1.5 bg-stone-100 rounded-full overflow-hidden flex items-center">
            <div 
              className={`h-full ${highlightColor} rounded-full transition-all duration-500`} 
              style={{ width: `${(valA / 10) * 100}%` }} 
            />
          </div>
          <div className="w-8 text-right font-mono text-ink font-medium">{valA.toFixed(1)}</div>
        </div>

        {/* Condition B */}
        <div className="flex items-center gap-3 text-xs">
          <div className="w-24 shrink-0 text-ink/50 truncate">{labelB}</div>
          <div className="flex-1 h-1.5 bg-stone-100 rounded-full overflow-hidden flex items-center">
            <div 
              className={`h-full ${neutralColor} rounded-full transition-all duration-500`} 
              style={{ width: `${(valB / 10) * 100}%` }} 
            />
          </div>
          <div className="w-8 text-right font-mono text-ink/60">{valB.toFixed(1)}</div>
        </div>
      </div>
    </div>
  );
}

export default function CorrelationInsights({ logs }: Props) {
  if (logs.length === 0) {
    return (
      <div className="border border-rule rounded-md p-8 flex flex-col items-center justify-center text-center bg-stone-50/50 h-full">
        <p className="font-mono text-xs text-ink/40 uppercase tracking-widest mb-2">Correlations</p>
        <p className="text-sm text-ink/60">Not enough daily logs to generate insights yet.</p>
      </div>
    );
  }

  // 1. Mood vs Workout
  const workoutMoods = logs.filter((l) => l.workout_today && l.mood !== null).map((l) => l.mood!);
  const nonWorkoutMoods = logs.filter((l) => !l.workout_today && l.mood !== null).map((l) => l.mood!);
  const avgWorkoutMood = workoutMoods.length ? (workoutMoods.reduce((a, b) => a + b, 0) / workoutMoods.length) : null;
  const avgNonWorkoutMood = nonWorkoutMoods.length ? (nonWorkoutMoods.reduce((a, b) => a + b, 0) / nonWorkoutMoods.length) : null;

  // 2. Energy vs Sleep (>=7h vs <6h)
  const goodSleepEnergy = logs.filter((l) => l.sleep_hours !== null && l.sleep_hours >= 7 && l.energy !== null).map((l) => l.energy!);
  const poorSleepEnergy = logs.filter((l) => l.sleep_hours !== null && l.sleep_hours < 6 && l.energy !== null).map((l) => l.energy!);
  const avgGoodSleepEnergy = goodSleepEnergy.length ? (goodSleepEnergy.reduce((a, b) => a + b, 0) / goodSleepEnergy.length) : null;
  const avgPoorSleepEnergy = poorSleepEnergy.length ? (poorSleepEnergy.reduce((a, b) => a + b, 0) / poorSleepEnergy.length) : null;

  // 3. Digestion vs Restaurant meals
  const restaurantDigestion = logs.filter((l) => l.restaurant_meal && l.digestion_rating !== null).map((l) => l.digestion_rating!);
  const homeDigestion = logs.filter((l) => !l.restaurant_meal && l.digestion_rating !== null).map((l) => l.digestion_rating!);
  const avgRestaurantDigestion = restaurantDigestion.length ? (restaurantDigestion.reduce((a, b) => a + b, 0) / restaurantDigestion.length) : null;
  const avgHomeDigestion = homeDigestion.length ? (homeDigestion.reduce((a, b) => a + b, 0) / homeDigestion.length) : null;

  const hasAnyInsight = 
    (avgWorkoutMood !== null && avgNonWorkoutMood !== null) ||
    (avgGoodSleepEnergy !== null && avgPoorSleepEnergy !== null) ||
    (avgHomeDigestion !== null && avgRestaurantDigestion !== null);

  if (!hasAnyInsight) {
    return (
      <div className="border border-rule rounded-md p-8 flex flex-col items-center justify-center text-center bg-stone-50/50 h-full">
        <p className="font-mono text-xs text-ink/40 uppercase tracking-widest mb-2">Correlations</p>
        <p className="text-sm text-ink/60">Keep logging data across different days to unlock behavioral insights.</p>
      </div>
    );
  }

  return (
    <div className="border border-rule rounded-md bg-white shadow-sm flex flex-col h-full">
      {/* Header */}
      <div className="p-5 border-b border-rule bg-stone-50/30">
        <h3 className="font-mono text-xs uppercase tracking-widest text-ink/50 mb-1">
          Behavioral Insights
        </h3>
        <p className="text-sm text-ink/80 font-medium">
          How your habits impact your daily wellbeing.
        </p>
      </div>

      {/* Insights List */}
      <div className="px-5">
        {avgWorkoutMood !== null && avgNonWorkoutMood !== null && (
          <InsightRow 
            title="Mood & Movement"
            labelA="Workout"
            valA={avgWorkoutMood}
            labelB="No Workout"
            valB={avgNonWorkoutMood}
            highlightColor="bg-[#2F6F62]" // Pine
          />
        )}

        {avgGoodSleepEnergy !== null && avgPoorSleepEnergy !== null && (
          <InsightRow 
            title="Energy & Sleep"
            labelA="7+ Hours"
            valA={avgGoodSleepEnergy}
            labelB="< 6 Hours"
            valB={avgPoorSleepEnergy}
            highlightColor="bg-[#B8860B]" // Gold/Ochre
          />
        )}

        {avgHomeDigestion !== null && avgRestaurantDigestion !== null && (
          <InsightRow 
            title="Digestion & Food Source"
            labelA="Home-cooked"
            valA={avgHomeDigestion}
            labelB="Takeout"
            valB={avgRestaurantDigestion}
            highlightColor="bg-[#B5453C]" // Rust
          />
        )}
      </div>
    </div>
  );
}