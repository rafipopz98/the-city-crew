"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import { GlassInputWrapper } from "./GlassInputWrapper";
import Link from "next/link";
import { Button } from "../common/Button";
import api from "@/lib/api/axios";
import { readStoredUtm, type GeoData } from "@/lib/utm";
import { getFirstLandingPage, getConversionPage } from "@/components/common/PageTracker";

export const SignUpPage = ({
  title = (
    <span className="font-light text-[#06182e] tracking-tighter">
      Create Account
    </span>
  ),
  description = "Join us today and start your journey.",
  heroImageSrc,
}: any) => {
  const router = useRouter();

  const searchParams = useSearchParams();

  const redirect = searchParams.get("redirect") || "/";
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  // Track UTM + geo state for submission
  const [utmData, setUtmData] = useState<Record<string, unknown> | null>(null);
  const [geoData, setGeoData] = useState<GeoData | null>(null);

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    username: "",
    email: "",
    password: "",
    confirm_password: "",
  });

  const passwordsMismatch =
    form.confirm_password.length > 0 && form.password !== form.confirm_password;

  // ─── On mount: read stored UTM params and fetch geo location ──────────
  useEffect(() => {
    const stored = readStoredUtm();
    if (stored) {
      setUtmData({ ...stored });
    }

    const fetchGeo = async () => {
      try {
        const res = await fetch("/api/geo");
        if (res.ok) {
          const data = await res.json();
          setGeoData(data);
        }
      } catch {
        // Geo is a nice-to-have; don't block sign-up
        console.warn("Could not fetch geo data");
      }
    };

    fetchGeo();
  }, []);

  const handleSignUp = async () => {
    try {
      setLoading(true);
      setError("");

      // basic frontend validation
      if (!form.firstName || !form.lastName || !form.email || !form.password) {
        setError("All fields are required");
        return;
      }

      if (form.username && (form.username.length < 3 || form.username.length > 20)) {
        setError("Username must be 3-20 characters");
        return;
      }

      if (form.username && !/^[a-zA-Z0-9_]+$/.test(form.username)) {
        setError("Username can only contain letters, numbers, and underscores");
        return;
      }

      if (form.password !== form.confirm_password) {
        setError("Passwords do not match");
        return;
      }

      // Build the payload once — attach utm_params only if we have data
      const payload: Record<string, unknown> = {
        first_name: form.firstName,
        last_name: form.lastName,
        username: form.username,
        email: form.email,
        password: form.password,
      };

      const hasUtmData = utmData && Object.keys(utmData).length > 0;
      if (hasUtmData || geoData) {
        const utm_params: Record<string, unknown> = {
          captured_at: new Date().toISOString(),
        };
        if (hasUtmData) utm_params.marketing = utmData;
        if (geoData) utm_params.geo = geoData;
        payload.utm_params = utm_params;
      }

      // ── Attach first landing page & conversion page ────────────────
      const firstLandingPage = getFirstLandingPage();
      const conversionPage = getConversionPage() || firstLandingPage;
      if (firstLandingPage) payload.first_landing_page = firstLandingPage;
      if (conversionPage) payload.conversion_page = conversionPage;

      await api.post("/auth/register", payload);

      router.push(redirect);
    } catch (err: any) {
      console.log(err);
      setError(
        err?.response?.data?.message || err?.message || "Something went wrong",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-[88vh] flex flex-col lg:flex-row bg-[#FFF5E5] font-geist">
      {/* LEFT */}
      <section className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="flex flex-col gap-5">
            <h1 className="text-4xl md:text-5xl font-semibold">{title}</h1>

            {/* FORM */}
            <div className="space-y-5">
              {/* NAME ROW */}
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="text-sm text-[#06182e]">First Name</label>

                  <GlassInputWrapper>
                    <input
                      value={form.firstName}
                      placeholder="First name"
                      onChange={(e) =>
                        setForm({ ...form, firstName: e.target.value })
                      }
                      className="w-full bg-transparent p-4 text-[#06182e] text-sm placeholder:text-[#06182e] focus:outline-none"
                    />
                  </GlassInputWrapper>
                </div>

                <div className="flex-1">
                  <label className="text-sm text-[#06182e]">Last Name</label>

                  <GlassInputWrapper>
                    <input
                      value={form.lastName}
                      placeholder="Last name"
                      onChange={(e) =>
                        setForm({ ...form, lastName: e.target.value })
                      }
                      className="w-full bg-transparent p-4 text-[#06182e] text-sm placeholder:text-[#06182e] focus:outline-none"
                    />
                  </GlassInputWrapper>
                </div>
              </div>

              {/* USERNAME */}
              <div>
                <label className="text-sm text-[#06182e]">
                  Manager Name <span className="text-[#06182e]/40">(optional)</span>
                </label>

                <GlassInputWrapper>
                  <input
                    value={form.username}
                    placeholder="Choose your manager name"
                    onChange={(e) =>
                      setForm({ ...form, username: e.target.value })
                    }
                    maxLength={20}
                    className="w-full bg-transparent p-4 text-[#06182e] text-sm placeholder:text-[#06182e] focus:outline-none"
                  />
                </GlassInputWrapper>
                <p className="text-xs text-[#06182e]/30 mt-1">
                  Letters, numbers, and underscores. 3-20 characters.
                </p>
              </div>

              {/* EMAIL */}
              <div>
                <label className="text-sm text-[#06182e]">Email Address</label>

                <GlassInputWrapper>
                  <input
                    value={form.email}
                    type="email"
                    placeholder="Enter your email"
                    onChange={(e) =>
                      setForm({ ...form, email: e.target.value })
                    }
                    className="w-full bg-transparent p-4 text-[#06182e] text-sm placeholder:text-[#06182e] focus:outline-none"
                  />
                </GlassInputWrapper>
              </div>

              {/* PASSWORD */}
              <div>
                <label className="text-sm text-[#06182e]">Password</label>

                <GlassInputWrapper>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={form.password}
                      placeholder="Create password"
                      onChange={(e) =>
                        setForm({ ...form, password: e.target.value })
                      }
                      className="w-full bg-transparent p-4 pr-12 text-[#06182e] text-sm placeholder:text-[#06182e] focus:outline-none"
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

              {/* CONFIRM PASSWORD */}
              <div>
                <label className="text-sm text-[#06182e]">
                  Confirm Password
                </label>

                <GlassInputWrapper error={passwordsMismatch}>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      value={form.confirm_password}
                      placeholder="Confirm password"
                      onChange={(e) =>
                        setForm({
                          ...form,
                          confirm_password: e.target.value,
                        })
                      }
                      className="w-full bg-transparent p-4 pr-12 text-[#06182e] text-sm placeholder:text-[#06182e] focus:outline-none"
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      className="absolute inset-y-0 right-3 flex items-center"
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="w-5 h-5 text-[#06182e]/40" />
                      ) : (
                        <Eye className="w-5 h-5 text-[#06182e]/40" />
                      )}
                    </button>
                  </div>
                </GlassInputWrapper>

                {passwordsMismatch && (
                  <p className="text-xs text-red-500 mt-1">
                    Passwords do not match
                  </p>
                )}
              </div>

              {/* BUTTON */}
              <Button
                onClick={handleSignUp}
                disabled={passwordsMismatch || loading}
                loading={loading}
                className="w-full rounded-2xl bg-[#06182e] py-4 text-[#FFF5E5] font-medium hover:opacity-90 transition-all"
              >
                Sign Up
              </Button>
              {error && (
                <p className="text-sm text-red-500 text-center">{error}</p>
              )}

              {/* TERMS */}
              <p className="text-center text-xs text-[#06182e]/50">
                By signing up, you agree to our{" "}
                <span className="text-[#e09225] hover:underline cursor-pointer">
                  Terms
                </span>{" "}
                and{" "}
                <span className="text-[#e09225] hover:underline cursor-pointer">
                  Privacy Policy
                </span>
              </p>
            </div>

            {/* DIVIDER */}
            <div className="relative flex items-center justify-center">
              <span className="w-full border-t border-[#06182e]/10"></span>
              <span className="absolute bg-[#FFF5E5] px-4 text-sm text-[#06182e]/40">
                Or continue with
              </span>
            </div>

            {/* FOOTER */}
            <p className="text-center text-sm text-[#06182e]/50">
              Already have an account?{" "}
              <Link
                className="text-[#e09225] hover:underline"
                href={`/login?redirect=${encodeURIComponent(redirect)}`}
              >
                Sign In
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
