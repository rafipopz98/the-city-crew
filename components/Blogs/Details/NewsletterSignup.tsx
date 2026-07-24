"use client";

import { useState } from "react";
import { Mail, ArrowRight, Check, Loader2 } from "lucide-react";
import { toast } from "sonner";

export const NewsletterSignup = () => {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setStatus("loading");
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        body: JSON.stringify({ email }),
      });

      if (!res.ok) throw new Error("Subscription failed");

      setStatus("success");
      toast.success("Thanks for subscribing!");
    } catch (error) {
      setStatus("error");
      toast.error("Something went wrong. Please try again.");
      console.error(error);
    }
  };

  return (
    <section className="bg-gradient-to-br from-[#FFF5E5] via-[#FFE8CC] to-[#FFF0DD] py-12 sm:py-16 md:py-20 px-4 sm:px-6">
      <div className="max-w-3xl mx-auto text-center">
        {/* Mail Icon */}
        <div className="flex justify-center mb-4 sm:mb-6">
          <div className="bg-[#06182e]/5 p-3 sm:p-4 rounded-2xl">
            <Mail className="text-[#e09225]" size={24} strokeWidth={1.5} />
          </div>
        </div>

        {/* Heading */}
        <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-[#06182e] mb-3 sm:mb-4 leading-tight">
          Never Miss a Story
        </h2>

        {/* Description */}
        <p className="text-sm sm:text-base text-[#06182e]/80 mb-6 sm:mb-8 md:mb-10 max-w-xl mx-auto px-2 leading-relaxed">
          Get the latest Manchester City news, match reports, and exclusive
          content delivered straight to your inbox.
        </p>

        {status === "success" ? (
          <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-3 text-green-600 bg-green-50 border border-green-200 rounded-2xl px-5 sm:px-8 py-4 sm:py-5 max-w-md mx-auto animate-fade-in">
            <div className="bg-green-100 p-2 rounded-full">
              <Check size={20} className="text-green-600" />
            </div>
            <span className="font-medium text-sm sm:text-base">
              You&apos;re all set! Check your inbox.
            </span>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="flex flex-col sm:flex-row gap-3 sm:gap-2 max-w-lg mx-auto"
          >
            <div className="flex-1 relative">
              <input
                type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="w-full px-4 sm:px-5 py-3 sm:py-3.5 rounded-xl sm:rounded-full bg-white border-2 border-[#06182e]/10 text-[#06182e] placeholder:text-[#06182e]/40 focus:outline-none focus:border-[#e09225] focus:ring-2 focus:ring-[#e09225]/20 transition-all duration-200 text-sm sm:text-base"
              required
            />
            </div>
            <button
              type="submit"
              disabled={status === "loading"}
              className="w-full sm:w-auto bg-[#e09225] hover:bg-[#c97d1e] active:scale-[0.98] text-white font-semibold px-6 sm:px-7 py-3 sm:py-3.5 rounded-xl sm:rounded-full transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed disabled:active:scale-100 flex items-center justify-center gap-2 text-sm sm:text-base shadow-lg shadow-[#e09225]/20 hover:shadow-xl hover:shadow-[#e09225]/30"
            >
              {status === "loading" ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  <span>Sending</span>
                </>
              ) : (
                <>
                  <span>Subscribe</span>
                  <ArrowRight size={18} className="hidden sm:inline" />
                </>
              )}
            </button>
          </form>
        )}

        {/* Error state */}
        {status === "error" && (
          <p className="text-red-500 text-sm mt-3 animate-fade-in">
            Something went wrong. Please try again.
          </p>
        )}
      </div>
    </section>
  );
};
