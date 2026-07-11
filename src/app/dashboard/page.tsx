import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import DashboardClient from "./DashboardClient";

export default async function DashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const [{ data: entries }, { data: profile }] = await Promise.all([
    supabase
      .from("entries")
      .select("*")
      .eq("user_id", user.id)
      .order("entry_date", { ascending: true }),
    supabase.from("profiles").select("*").eq("id", user.id).single(),
  ]);

  return (
    <DashboardClient
      userEmail={user.email ?? ""}
      displayName={profile?.display_name ?? null}
      goalWeightKg={profile?.goal_weight_kg ?? null}
      initialEntries={entries ?? []}
    />
  );
}
