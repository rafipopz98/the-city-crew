"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { GlassInputWrapper } from "./GlassInputWrapper";
import { Button } from "../common/Button";
import Link from "next/link";
import api from "@/lib/api/axios";
import { useRouter } from "next/navigation";

export const SignInPage = ({
  title = (
    <span className="font-light text-[#06182e] tracking-tighter">Welcome</span>
  ),
  description = "Sign in to your account and pick up where you left off.",
  heroImageSrc = "https://i.pinimg.com/1200x/d8/c4/0a/d8c40a61ad22d8341ab00bc5ebfdd72d.jpg",
  onForgotPassword,
}: any) => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const handleSignIn = async () => {
    try {
      setLoading(true);
      setError("");

      if (!form.email || !form.password) {
        setError("Email and password are required");
        return;
      }

      await api.post("/auth/login", {
        email: form.email,
        password: form.password,
      });

      // cookies already set by backend
      router.push("/");
    } catch (err: any) {
      setError(
        err?.response?.data?.message || err?.message || "Invalid credentials",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-[90vh] flex flex-col lg:flex-row bg-[#FFF5E5] font-geist">
      {/* LEFT */}
      <section className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="flex flex-col gap-6">
            <h1 className="text-4xl md:text-5xl font-semibold leading-tight">
              {title}
            </h1>

            <p className="text-[#06182e]">{description}</p>

            {/* FORM */}
            <div className="space-y-5">
              {/* EMAIL */}
              <div>
                <label className="text-sm font-medium text-[#06182e]">
                  Email Address
                </label>

                <GlassInputWrapper>
                  <input
                    value={form.email}
                    type="email"
                    placeholder="Enter your email"
                    onChange={(e) =>
                      setForm({ ...form, email: e.target.value })
                    }
                    className="w-full bg-transparent text-[#06182e] text-sm p-4 rounded-2xl focus:outline-none placeholder:text-[#06182e]"
                  />
                </GlassInputWrapper>
              </div>

              {/* PASSWORD */}
              <div>
                <label className="text-sm font-medium text-[#06182e]">
                  Password
                </label>

                <GlassInputWrapper>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={form.password}
                      placeholder="Enter your password"
                      onChange={(e) =>
                        setForm({ ...form, password: e.target.value })
                      }
                      className="w-full bg-transparent text-[#06182e] text-sm p-4 pr-12 rounded-2xl focus:outline-none placeholder:text-[#06182e]"
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleSignIn();
                      }}
                    />

                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-3 flex items-center"
                    >
                      {showPassword ? (
                        <EyeOff className="w-5 h-5 text-[#06182e]/40 hover:text-[#06182e]" />
                      ) : (
                        <Eye className="w-5 h-5 text-[#06182e]/40 hover:text-[#06182e]" />
                      )}
                    </button>
                  </div>
                </GlassInputWrapper>
              </div>

              {/* OPTIONS */}
              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" className="accent-[#e09225]" />
                  <span className="text-[#06182e]/80">Keep me signed in</span>
                </label>

                <a
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    onForgotPassword?.();
                  }}
                  className="text-[#e09225] hover:underline"
                >
                  Forgot password
                </a>
              </div>

              {/* BUTTON */}
              <Button
                onClick={handleSignIn}
                disabled={loading}
                loading={loading}
                className="w-full font-medium"
              >
                Sign In
              </Button>
              {error && (
                <p className="text-sm text-red-500 text-center">{error}</p>
              )}
            </div>

            {/* DIVIDER */}
            <div className="relative flex items-center justify-center">
              <span className="w-full border-t border-[#06182e]/10"></span>
            </div>

            {/* FOOTER */}
            <p className="text-center text-sm text-[#06182e]/50">
              New here?{" "}
              <Link href="/sign-up" className="text-[#e09225] hover:underline">
                Create Account
              </Link>
            </p>
          </div>
        </div>
      </section>

      {/* RIGHT IMAGE */}
      {heroImageSrc && (
        <section className="hidden lg:block flex-1 relative p-4">
          <div
            className="absolute inset-4 rounded-3xl bg-cover bg-center"
            style={{ backgroundImage: `url(${heroImageSrc})` }}
          />
        </section>
      )}
    </div>
  );
};
