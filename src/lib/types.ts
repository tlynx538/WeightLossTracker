export type Entry = {
  id: string;
  user_id: string;
  entry_date: string; // YYYY-MM-DD
  weight_kg: number;
  waist_cm: number | null;
  hip_cm: number | null;
  chest_cm: number | null;
  notes: string | null;
  created_at: string;
};

export type NewEntry = {
  entry_date: string;
  weight_kg: number;
  waist_cm: number | null;
  hip_cm: number | null;
  chest_cm: number | null;
  notes: string | null;
};
