"use client";

import { useState } from "react";
import { Mail, ArrowRight, Check } from "lucide-react";
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
      await fetch("/api/newsletter", {
        method: "POST",
        body: JSON.stringify({ email }),
      });
      setStatus("success");
      toast.success("Thanks for subscribing!");
    } catch (error) {
      setStatus("error");
      console.error(error);
    }
  };

  return (
    <section className="bg-[#FFF5E5] py-16 md:py-20">
      <div className="max-w-3xl mx-auto px-5 text-center">
        <div className="flex justify-center mb-4">
          <Mail className="text-[#06182e]" size={32} />
        </div>
        <h2 className="text-3xl md:text-4xl font-bold text-[#06182e] mb-4">
          Never Miss a Story
        </h2>
        <p className="text-[#06182e] mb-8 max-w-xl mx-auto">
          Get the latest Manchester City news, match reports, and exclusive
          content delivered straight to your inbox.
        </p>

        {status === "success" ? (
          <div className="flex items-center justify-center gap-2 text-green-400">
            <Check size={20} />
            <span>Thanks for subscribing!</span>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex gap-3 max-w-md mx-auto">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="flex-1 px-4 py-3 rounded-full bg-white border border-[#06182e]/20 text-[#06182e] placeholder:text-[#06182e]/50 focus:outline-none focus:border-[#06182e] transition-colors"
              required
            />
            <button
              type="submit"
              disabled={status === "loading"}
              className="bg-[#e09225] text-white font-bold px-6 py-3 rounded-full hover:bg-[#e09225] transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {status === "loading" ? "Sending..." : "Subscribe"}
              <ArrowRight size={18} />
            </button>
          </form>
        )}
      </div>
    </section>
  );
};
