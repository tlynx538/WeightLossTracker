"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function SignupPage() {
  const router = useRouter();
  const supabase = createClient();
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { display_name: displayName } },
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    // If email confirmations are enabled in Supabase, there's no session yet.
    if (!data.session) {
      setMessage("Check your email to confirm your account, then sign in.");
      setLoading(false);
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <div className="mb-8">
          <p className="font-mono text-xs tracking-widest text-pine uppercase mb-2">
            000 / Create account
          </p>
          <h1 className="text-3xl font-bold text-ink">Start your logbook</h1>
          <p className="text-sm text-ink/60 mt-1">
            Takes a minute. Your data stays private to your account.
          </p>
        </div>

        <div className="tape-rule mb-8" />

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-mono uppercase tracking-wide text-ink/60 mb-1">
              Name
            </label>
            <input
              type="text"
              required
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="w-full border border-rule bg-white/70 rounded-sm px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pine"
              placeholder="Jordan"
            />
          </div>
          <div>
            <label className="block text-xs font-mono uppercase tracking-wide text-ink/60 mb-1">
              Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-rule bg-white/70 rounded-sm px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pine"
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label className="block text-xs font-mono uppercase tracking-wide text-ink/60 mb-1">
              Password
            </label>
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-rule bg-white/70 rounded-sm px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pine"
              placeholder="At least 6 characters"
            />
          </div>

          {error && (
            <p className="text-sm text-rust bg-rust/5 border border-rust/20 rounded-sm px-3 py-2">
              {error}
            </p>
          )}
          {message && (
            <p className="text-sm text-pine bg-pine-light border border-pine/20 rounded-sm px-3 py-2">
              {message}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-pine hover:bg-pine-dark text-white text-sm font-medium rounded-sm py-2.5 transition-colors disabled:opacity-60"
          >
            {loading ? "Creating account…" : "Create account"}
          </button>
        </form>

        <p className="text-sm text-ink/60 mt-6">
          Already have an account?{" "}
          <Link href="/login" className="text-pine font-medium hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </main>
  );
}
