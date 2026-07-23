// lib/types.ts

// --- Entry: body metrics logged weekly ---
export interface Entry {
  id: string;
  user_id: string;
  entry_date: string;
  weight_kg: number;
  waist_cm: number | null;
  hip_cm: number | null;
  chest_cm: number | null;
  neck_cm: number | null;
  right_upper_arm_cm: number | null;
  right_thigh_cm: number | null;
  body_fat_percent: number | null;
  resting_heart_rate: number | null;
  photo_front: string | null;
  photo_side: string | null;
  photo_back: string | null;
  notes: string | null;
  created_at: string;
}

export type NewEntry = Omit<Entry, 'id' | 'user_id' | 'created_at'>;

// --- Daily Log: daily health habits ---
export interface DailyLog {
  id: string;
  user_id: string;
  log_date: string;
  sleep_hours: number | null;
  sleep_quality: number | null;
  bedtime: string | null;
  wake_time: string | null;
  water_l: number | null;
  mood: number | null;
  energy: number | null;
  stress: number | null;
  focus: number | null;
  digestion_rating: number | null;
  constipation: boolean;
  diarrhea: boolean;
  bloating: boolean;
  acid_reflux: boolean;
  breakfast: string | null;
  lunch: string | null;
  dinner: string | null;
  snacks: string | null;
  restaurant_meal: boolean;
  protein_target_met: boolean;
  fruit_servings: number | null;
  veg_servings: number | null;
  workout_today: boolean;
  workout_type: string | null;
  workout_duration_min: number | null;
  cardio_duration_min: number | null;
  steps: number | null;
  pain_today: number | null;
  habit_protein_breakfast: boolean;
  habit_meal_prepped: boolean;
  habit_water_goal: boolean;
  habit_workout: boolean;
  habit_no_delivery: boolean;
  habit_logged_food: boolean;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export type NewDailyLog = Omit<DailyLog, 'id' | 'user_id' | 'created_at' | 'updated_at'>;

// --- Profile: user settings and goals ---
export interface Profile {
  id: string;
  display_name: string | null;
  goal_weight_kg: number | null;
  height_cm: number | null;
  age: number | null;
  // ... other profile fields if any
}

// --- Habit fields ---
export const HABIT_FIELDS = [
  'habit_protein_breakfast',
  'habit_meal_prepped',
  'habit_water_goal',
  'habit_workout',
  'habit_no_delivery',
  'habit_logged_food',
] as const;

export type HabitField = typeof HABIT_FIELDS[number];

export const HABIT_LABELS: Record<HabitField, string> = {
  habit_protein_breakfast: 'Protein breakfast',
  habit_meal_prepped: 'Meal prepped meal eaten',
  habit_water_goal: 'Water goal',
  habit_workout: 'Workout (if scheduled)',
  habit_no_delivery: 'No delivery',
  habit_logged_food: 'Logged today’s food',
};

// --- Health System Score weights ---
export const HEALTH_WEIGHTS = {
  habit_meal_prepped: 0.25,
  protein_target_met: 0.20,
  habit_workout: 0.20,
  sleep_adequate: 0.15,
  water_goal: 0.10,
  habit_logged_food: 0.10,
} as const;