"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { CompleteProfileModal } from "@/components/auth/CompleteProfileModal";
import {
  Home,
  Swords,
  Bot,
  Wifi,
  Store,
  Library,
  User,
  ChevronLeft,
  Trophy,
  Menu,
  X,
  BarChart3,
  TrendingUp,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const NAV_ITEMS = [
  { label: "Home", icon: Home, href: "/game/home", shortcut: "1" },
  { label: "Play", icon: Swords, href: "/game/play", shortcut: "2", isPlay: true },
  { label: "Shop", icon: Store, href: "/game/shop", shortcut: "3" },
  { label: "Upgrade", icon: TrendingUp, href: "/game/upgrade", shortcut: "4" },
  { label: "Collection", icon: Library, href: "/game/collection", shortcut: "5" },
  { label: "Leaderboard", icon: BarChart3, href: "/game/leaderboard", shortcut: "6" },
  { label: "Profile", icon: User, href: "/game/profile", shortcut: "7" },
];

const HOW_TO_PLAY = { label: "How to Play", icon: Trophy, href: "/game/how-to-play" };

export default function GameLayout({ children }: { children: React.ReactNode }) {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [playMenuOpen, setPlayMenuOpen] = useState(false);
  const playMenuRef = useRef<HTMLDivElement>(null);

  // Close play menu on click outside
  useEffect(() => {
    if (!playMenuOpen) return;
    const handleClick = (e: MouseEvent) => {
      if (playMenuRef.current && !playMenuRef.current.contains(e.target as Node)) {
        setPlayMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [playMenuOpen]);

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
              onClick={() => router.push('/game/home')}
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
                <div key={item.href} className="relative">
                  <button
                    onClick={() => {
                      if (item.isPlay) {
                        setPlayMenuOpen(!playMenuOpen);
                      } else {
                        router.push(item.href);
                      }
                    }}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      active
                        ? "bg-[#e09225]/10 text-[#e09225]"
                        : "text-gray-400 hover:text-white hover:bg-white/5"
                    }`}
                  >
                    <item.icon className="w-4 h-4" />
                    {item.label}
                  </button>
                  {/* Play dropdown */}
                  {item.isPlay && playMenuOpen && (
                    <motion.div
                      ref={playMenuRef}
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="absolute top-full left-0 mt-1 w-52 bg-[#0a1628] border border-white/10 rounded-xl shadow-2xl overflow-hidden z-50"
                    >
                      <button
                        onClick={() => { router.push("/game/play"); setPlayMenuOpen(false); }}
                        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/5 transition text-left"
                      >
                        <div className="w-9 h-9 rounded-lg bg-green-500/10 border border-green-500/20 flex items-center justify-center">
                          <Bot className="w-4 h-4 text-green-400" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-white">Bot Match</p>
                          <p className="text-[10px] text-gray-500">Play against AI, instant match</p>
                        </div>
                      </button>
                      <div className="mx-3 h-px bg-white/5" />
                      <button
                        onClick={() => { router.push("/game/play/pvp"); setPlayMenuOpen(false); }}
                        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/5 transition text-left"
                      >
                        <div className="w-9 h-9 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                          <Wifi className="w-4 h-4 text-blue-400" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-white">Online PvP</p>
                          <p className="text-[10px] text-gray-500">Play against real players</p>
                        </div>
                      </button>
                    </motion.div>
                  )}
                </div>
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

      {/* Profile completion prompt (auto-created / incomplete accounts).
          Mandatory (no skip) on the onboarding page itself — onboarding
          can't succeed without a username, so letting it be dismissed there
          just leads to a confusing failed-request error instead. */}
      <CompleteProfileModal required={pathname.startsWith("/game/onboarding")} />
    </div>
  );
}
