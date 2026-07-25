"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import {
  Home,
  Swords,
  Store,
  Library,
  User,
  ChevronLeft,
  Trophy,
  Menu,
  X,
  BarChart3,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const NAV_ITEMS = [
  { label: "Home", icon: Home, href: "/game/home", shortcut: "1" },
  { label: "Play", icon: Swords, href: "/game/play", shortcut: "2" },
  { label: "Shop", icon: Store, href: "/game/shop", shortcut: "3" },
  { label: "Collection", icon: Library, href: "/game/collection", shortcut: "4" },
  { label: "Leaderboard", icon: BarChart3, href: "/game/leaderboard", shortcut: "5" },
  { label: "Profile", icon: User, href: "/game/profile", shortcut: "6" },
];

const HOW_TO_PLAY = { label: "How to Play", icon: Trophy, href: "/game/how-to-play" };

export default function GameLayout({ children }: { children: React.ReactNode }) {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Redirect to onboarding if not set up
  useEffect(() => {
    if (!authLoading && user && !pathname.includes("/game/onboarding")) {
      // We'll check game user status in pages themselves
    }
  }, [user, authLoading, pathname, router]);

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + "/");

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#0a1628] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#e09225] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-[#0a1628] flex flex-col items-center justify-center gap-6 p-8">
        <div className="w-20 h-20 rounded-full bg-[#e09225]/10 border-2 border-[#e09225]/30 flex items-center justify-center">
          <Trophy className="w-10 h-10 text-[#e09225]" />
        </div>
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-2">TCC Manager</h1>
          <p className="text-gray-400 mb-6">Sign in to manage your club</p>
          <button
            onClick={() => router.push(`/login?redirect=${encodeURIComponent(pathname)}`)}
            className="px-8 py-3 bg-[#e09225] text-[#0a1628] font-bold rounded-xl hover:bg-[#e09225]/90 transition"
          >
            Sign In
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a1628] text-white overflow-hidden">
      {/* Top Bar */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-[#0a1628]/95 backdrop-blur-lg border-b border-white/5">
        <div className="flex items-center justify-between px-4 py-2 h-14">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.back()}
              className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center hover:bg-white/10 transition"
            >
              <ChevronLeft className="w-4 h-4 text-gray-400" />
            </button>
            <div className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-[#e09225]" />
              <span className="font-bold text-sm tracking-wide">TCC MANAGER</span>
            </div>
          </div>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            {NAV_ITEMS.map((item) => {
              const active = isActive(item.href);
              return (
                <button
                  key={item.href}
                  onClick={() => router.push(item.href)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    active
                      ? "bg-[#e09225]/10 text-[#e09225]"
                      : "text-gray-400 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <item.icon className="w-4 h-4" />
                  {item.label}
                </button>
              );
            })}
            <div className="w-px h-6 bg-white/10 mx-1" />
            <button
              onClick={() => router.push(HOW_TO_PLAY.href)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                isActive(HOW_TO_PLAY.href)
                  ? "bg-[#e09225]/10 text-[#e09225]"
                  : "text-gray-400 hover:text-white hover:bg-white/5"
              }`}
            >
              <HOW_TO_PLAY.icon className="w-4 h-4" />
              {HOW_TO_PLAY.label}
            </button>
          </nav>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center"
          >
            {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </header>        {/* Mobile Nav */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="fixed top-14 left-0 right-0 z-40 bg-[#0a1628]/98 backdrop-blur-lg border-b border-white/5 md:hidden"
          >
            <nav className="p-4 grid grid-cols-4 gap-1">
              {[...NAV_ITEMS, HOW_TO_PLAY].map((item) => {
                const active = isActive(item.href);
                return (
                  <button
                    key={item.href}
                    onClick={() => {
                      router.push(item.href);
                      setMobileMenuOpen(false);
                    }}
                    className={`flex flex-col items-center gap-1 py-3 rounded-lg transition-all ${
                      active ? "bg-[#e09225]/10 text-[#e09225]" : "text-gray-400 hover:text-white"
                    }`}
                  >
                    <item.icon className="w-5 h-5" />
                    <span className="text-[10px] font-medium">{item.label}</span>
                  </button>
                );
              })}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="pt-14 h-screen overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
