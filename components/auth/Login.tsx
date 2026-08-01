"use client";

import { useEffect, useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { GlassInputWrapper } from "./GlassInputWrapper";
import { Button } from "../common/Button";
import Link from "next/link";
import api from "@/lib/api/axios";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { useSearchParams } from "next/navigation";
import { getConversionPage, getFirstLandingPage } from "@/components/common/PageTracker";
import { readStoredUtm, type GeoData } from "@/lib/utm";

export const SignInPage = ({
  title = (
    <span className="font-light text-[#06182e] tracking-tighter">Welcome</span>
  ),
  description = "Sign in to your account and pick up where you left off.",
  heroImageSrc = "https://i.pinimg.com/1200x/d8/c4/0a/d8c40a61ad22d8341ab00bc5ebfdd72d.jpg",
  onForgotPassword,
}: {
  title?: React.ReactNode;
  description?: string;
  heroImageSrc?: string;
  onForgotPassword?: () => void;
}) => {
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") || "/";
  const { refreshUser } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({
    email: "",
    password: "",
  });
  // UTM + geo captured for auto-created accounts (sign in = sign up)
  const [utmData, setUtmData] = useState<Record<string, unknown> | null>(null);
  const [geoData, setGeoData] = useState<GeoData | null>(null);

  // ─── On mount: read stored UTM params and fetch geo location ──────
  useEffect(() => {
    const stored = readStoredUtm();
    if (stored) setUtmData({ ...stored });

    const fetchGeo = async () => {
      try {
        const res = await fetch("/api/geo");
        if (res.ok) {
          const data = await res.json();
          setGeoData(data);
        }
      } catch {
        // Geo is a nice-to-have; don't block login
        console.warn("Could not fetch geo data");
      }
    };

    fetchGeo();
  }, []);

  const handleSignIn = async () => {
    try {
      setLoading(true);

      if (!form.email || !form.password) {
        toast.error("Email and password are required.");
        return;
      }

      // ── Attach conversion page + utm/geo for auto-created accounts ──
      const conversionPage = getConversionPage();
      const firstLandingPage = getFirstLandingPage();
      const loginPayload: Record<string, unknown> = { ...form };
      if (conversionPage) loginPayload.conversion_page = conversionPage;
      if (firstLandingPage) loginPayload.first_landing_page = firstLandingPage;

      const hasUtmData = utmData && Object.keys(utmData).length > 0;
      if (hasUtmData || geoData) {
        const utm_params: Record<string, unknown> = {
          captured_at: new Date().toISOString(),
        };
        if (hasUtmData) utm_params.marketing = utmData;
        if (geoData) utm_params.geo = geoData;
        loginPayload.utm_params = utm_params;
      }

      const res = await api.post("/auth/login", loginPayload);

      // refresh global auth state
      await refreshUser();

      if (res.data?.signedUpFromLogin) {
        toast.success("Welcome! Your account was created", {
          description: "Finish setting up your profile in the next step.",
        });
      } else {
        toast.success("Welcome back", {
          description: "You have successfully signed in.",
        });
      }

      router.push(redirect);
    } catch (err: unknown) {
      const error = err as {
        response?: { status?: number; data?: { message?: string } };
      };
      const status = error?.response?.status;

      const message = error?.response?.data?.message;

      if (status === 400) {
        toast.error("Missing Information", {
          description: message || "Please enter your email and password.",
        });
      } else if (status === 401) {
        toast.error("Sign In Failed", {
          description: message || "Email or password is incorrect.",
        });
      } else {
        toast.error("Something Went Wrong", {
          description: "Please try again.",
        });
      }
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
            </div>

            {/* DIVIDER */}
            <div className="relative flex items-center justify-center">
              <span className="w-full border-t border-[#06182e]/10"></span>
            </div>

            {/* FOOTER */}
            <p className="text-center text-sm text-[#06182e]/50">
              New here?{" "}
              <Link
                className="text-[#e09225] hover:underline"
                href={`/sign-up?redirect=${encodeURIComponent(redirect)}`}
              >
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
