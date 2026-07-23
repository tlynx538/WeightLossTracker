import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import HistoryClient from "./HistoryClient";

export default async function HistoryPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const [{ data: entries }, { data: dailyLogs }] = await Promise.all([
    supabase
      .from("entries")
      .select("*")
      .eq("user_id", user.id)
      .order("entry_date", { ascending: false }),
    supabase
      .from("daily_logs")
      .select("*")
      .eq("user_id", user.id)
      .order("log_date", { ascending: false }),
  ]);

  return (
    <HistoryClient
      userEmail={user.email ?? ""}
      displayName={user.user_metadata?.display_name ?? null}
      entries={entries ?? []}
      dailyLogs={dailyLogs ?? []}
    />
  );
}