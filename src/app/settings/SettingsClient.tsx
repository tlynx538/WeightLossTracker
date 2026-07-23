"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type Props = {
  user: any;
  profile: any;
};

export default function SettingsClient({ user, profile }: Props) {
  const supabase = createClient();
  const router = useRouter();

  // Profile fields
  const [heightCm, setHeightCm] = useState(profile?.height_cm?.toString() || "");
  const [age, setAge] = useState(profile?.age?.toString() || "");
  const [goalWeightKg, setGoalWeightKg] = useState(profile?.goal_weight_kg?.toString() || "");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  // Password fields
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [changingPassword, setChangingPassword] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState<string | null>(null);

  // --- Profile update ---
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    const { error } = await supabase
      .from("profiles")
      .update({
        height_cm: heightCm ? parseFloat(heightCm) : null,
        age: age ? parseInt(age) : null,
        goal_weight_kg: goalWeightKg ? parseFloat(goalWeightKg) : null,
      })
      .eq("id", user.id);

    if (error) {
      setMessage("Error updating profile.");
    } else {
      setMessage("Settings saved!");
      router.refresh();
    }
    setSaving(false);
  }

  // --- Password change ---
  async function handlePasswordChange(e: React.FormEvent) {
    e.preventDefault();
    setPasswordMessage(null);

    // Validate
    if (newPassword.length < 6) {
      setPasswordMessage("New password must be at least 6 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordMessage("Passwords do not match.");
      return;
    }

    setChangingPassword(true);
    // Supabase requires the current password only if the user signed up with email/password.
    // For OAuth users, this will fail – we'll handle the error.
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) {
      setPasswordMessage(`Error: ${error.message}`);
    } else {
      setPasswordMessage("Password updated successfully!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    }
    setChangingPassword(false);
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/login");
  }

  return (
    <main className="min-h-screen max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-ink">Settings</h1>
        <button
          onClick={handleLogout}
          className="text-sm text-ink/50 hover:text-rust"
        >
          Sign out
        </button>
      </div>

      {/* Profile Settings */}
      <div className="border border-rule rounded-md bg-white p-6 shadow-sm mb-6">
        <h2 className="text-sm font-bold text-ink mb-4">Profile & Goals</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-ink/80 mb-1">
              Height (cm)
            </label>
            <input
              type="number"
              step="0.1"
              value={heightCm}
              onChange={(e) => setHeightCm(e.target.value)}
              className="w-full border border-rule bg-white/70 rounded-sm px-3 py-2 text-sm"
              placeholder="e.g., 175"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-ink/80 mb-1">
              Age
            </label>
            <input
              type="number"
              value={age}
              onChange={(e) => setAge(e.target.value)}
              className="w-full border border-rule bg-white/70 rounded-sm px-3 py-2 text-sm"
              placeholder="e.g., 30"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-ink/80 mb-1">
              Final Goal Weight (kg)
            </label>
            <input
              type="number"
              step="0.1"
              value={goalWeightKg}
              onChange={(e) => setGoalWeightKg(e.target.value)}
              className="w-full border border-rule bg-white/70 rounded-sm px-3 py-2 text-sm"
              placeholder="e.g., 100"
            />
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button
              type="submit"
              disabled={saving}
              className="bg-pine text-white text-sm font-medium rounded-sm px-6 py-2 hover:bg-pine/90 disabled:opacity-50"
            >
              {saving ? "Saving…" : "Save Settings"}
            </button>
            {message && (
              <span className={`text-sm ${message.includes("Error") ? "text-rust" : "text-pine"}`}>
                {message}
              </span>
            )}
          </div>
        </form>
      </div>

      {/* Password Change */}
      <div className="border border-rule rounded-md bg-white p-6 shadow-sm">
        <h2 className="text-sm font-bold text-ink mb-4">Change Password</h2>
        <form onSubmit={handlePasswordChange} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-ink/80 mb-1">
              Current Password
            </label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full border border-rule bg-white/70 rounded-sm px-3 py-2 text-sm"
              placeholder="Enter current password"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-ink/80 mb-1">
              New Password
            </label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full border border-rule bg-white/70 rounded-sm px-3 py-2 text-sm"
              placeholder="Min 6 characters"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-ink/80 mb-1">
              Confirm New Password
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full border border-rule bg-white/70 rounded-sm px-3 py-2 text-sm"
              placeholder="Re-enter new password"
              required
            />
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button
              type="submit"
              disabled={changingPassword}
              className="bg-ink text-white text-sm font-medium rounded-sm px-6 py-2 hover:bg-ink/90 disabled:opacity-50"
            >
              {changingPassword ? "Updating…" : "Change Password"}
            </button>
            {passwordMessage && (
              <span className={`text-sm ${passwordMessage.includes("Error") || passwordMessage.includes("must") ? "text-rust" : "text-pine"}`}>
                {passwordMessage}
              </span>
            )}
          </div>
        </form>
      </div>

      <div className="mt-6">
        <button
          onClick={() => router.push("/dashboard")}
          className="text-sm text-ink/50 hover:text-ink"
        >
          ← Back to Dashboard
        </button>
      </div>
    </main>
  );
}