"use client";

import { useState } from "react";
import { Loader2, Sparkles, X } from "lucide-react";
import api from "@/lib/api/axios";
import { useAuth } from "@/context/AuthContext";

/**
 * Dismissal is tracked per user so one account's choice doesn't suppress
 * the prompt for another account on the same browser.
 */
const dismissKeyFor = (userId?: string) =>
  `tcc_profile_prompt_dismissed_${userId || "anon"}`;

/**
 * Shown to logged-in users whose profile is incomplete — typically accounts
 * auto-created from the login flow (signedUpFromLogin) or fresh sign-ups
 * that skipped name/username. Collects first name, last name & username.
 */
export function CompleteProfileModal() {
  const { user, refreshUser } = useAuth();
  // Track WHICH user dismissed, so a different account logging in on the
  // same session still gets prompted.
  const [dismissedUser, setDismissedUser] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    username: "",
  });

  const needsProfile =
    !!user && !user.profile_completed && !user.first_name;

  // Visibility is derived at render time (no effect needed):
  // - SSR + initial client render have user === null, so this stays hidden.
  // - Once auth loads and the user has an incomplete profile, we read the
  //   per-user dismiss flag and show the modal accordingly.
  const storedDismissed =
    typeof window !== "undefined" &&
    needsProfile &&
    localStorage.getItem(dismissKeyFor(user?.id)) === "true";

  const show =
    needsProfile && dismissedUser !== user?.id && !storedDismissed;

  const handleClose = () => {
    localStorage.setItem(dismissKeyFor(user?.id), "true");
    setDismissedUser(user?.id ?? null);
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      setError("");

      if (!form.first_name.trim()) {
        setError("Please enter your first name.");
        return;
      }

      const payload: Record<string, unknown> = {
        first_name: form.first_name.trim(),
        last_name: form.last_name.trim(),
        username: form.username.trim(),
      };

      await api.put("/auth/profile", payload);
      localStorage.setItem(dismissKeyFor(user?.id), "true");
      setDismissedUser(user?.id ?? null);
      await refreshUser();
    } catch (err: unknown) {
      const errorObj = err as {
        response?: { data?: { message?: string } };
        message?: string;
      };
      setError(
        errorObj?.response?.data?.message ||
          errorObj?.message ||
          "Something went wrong",
      );
    } finally {
      setLoading(false);
    }
  };

  // Not logged in, already complete, or dismissed — render nothing.
  if (!user || !show) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-black/55 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="relative w-full max-w-md bg-[#FFF5E5] rounded-2xl shadow-[0_35px_100px_rgba(0,0,0,.30)] overflow-hidden animate-slide-up">
        {/* Decorative top */}
        <div className="pointer-events-none absolute -top-20 -right-20 w-52 h-52 rounded-full bg-[#e09225]/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-16 -left-16 w-40 h-40 rounded-full bg-[#e09225]/8 blur-2xl" />

        <button
          onClick={handleClose}
          className="absolute top-4 right-4 p-2 rounded-full text-[#06182e]/40 hover:text-[#06182e] hover:bg-[#06182e]/5 transition-colors z-10"
          aria-label="Close"
        >
          <X size={18} />
        </button>

        <div className="relative p-6 sm:p-8">
          <div className="text-center mb-6">
            <div className="w-14 h-14 rounded-2xl bg-[#e09225]/12 flex items-center justify-center mx-auto mb-4">
              <Sparkles size={26} className="text-[#e09225]" />
            </div>
            <h2 className="head text-2xl sm:text-3xl uppercase text-[#06182e] tracking-tight">
              Finish your profile
            </h2>
            <p className="para text-xs text-[#06182e]/50 mt-2 max-w-xs mx-auto">
              Tell us your name so we know what to call you across the crew —
              quizzes, the game &amp; leaderboards.
            </p>
          </div>

          {/* key={user.id} resets the form when a different user logs in */}
          <form
            key={user.id}
            className="space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              handleSubmit();
            }}
          >
            <div>
              <label className="text-xs font-semibold text-[#06182e]/70 para">
                First Name *
              </label>
              <input
                type="text"
                value={form.first_name}
                onChange={(e) => {
                  setForm({ ...form, first_name: e.target.value });
                  setError("");
                }}
                placeholder="e.g. Alex"
                className="mt-1 w-full bg-[#ece1cf]/50 border border-[#06182e]/10 rounded-xl px-4 py-3 text-sm text-[#06182e] placeholder:text-[#06182e]/25 focus:outline-none focus:border-[#e09225] focus:ring-2 focus:ring-[#e09225]/20 transition-all"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-[#06182e]/70 para">
                Last Name
              </label>
              <input
                type="text"
                value={form.last_name}
                onChange={(e) => setForm({ ...form, last_name: e.target.value })}
                placeholder="e.g. Johnson"
                className="mt-1 w-full bg-[#ece1cf]/50 border border-[#06182e]/10 rounded-xl px-4 py-3 text-sm text-[#06182e] placeholder:text-[#06182e]/25 focus:outline-none focus:border-[#e09225] focus:ring-2 focus:ring-[#e09225]/20 transition-all"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-[#06182e]/70 para">
                Username{" "}
                <span className="text-[#06182e]/35">(optional)</span>
              </label>
              <input
                type="text"
                value={form.username}
                onChange={(e) => {
                  setForm({
                    ...form,
                    username: e.target.value
                      .toLowerCase()
                      .replace(/[^a-z0-9_]/g, ""),
                  });
                  setError("");
                }}
                placeholder="e.g. alex_j9"
                maxLength={20}
                className="mt-1 w-full bg-[#ece1cf]/50 border border-[#06182e]/10 rounded-xl px-4 py-3 text-sm text-[#06182e] placeholder:text-[#06182e]/25 focus:outline-none focus:border-[#e09225] focus:ring-2 focus:ring-[#e09225]/20 transition-all"
              />
              <p className="text-[10px] text-[#06182e]/30 mt-1.5 para">
                3–20 characters • lowercase • a-z, 0-9, underscores
              </p>
            </div>

            {error && (
              <p className="text-xs text-red-500 text-center para">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl bg-[#e09225] text-[#FFF5E5] font-bold text-sm hover:brightness-110 active:scale-[0.99] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading && <Loader2 size={15} className="animate-spin" />}
              {loading ? "Saving…" : "Save & continue"}
            </button>

            <button
              type="button"
              onClick={handleClose}
              className="w-full py-2 text-xs font-bold text-[#06182e]/40 hover:text-[#06182e]/70 transition-colors"
            >
              I&apos;ll do this later
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
