"use client";

import { motion } from "framer-motion";
import {
  Swords,
  Store,
  Library,
  User,
  Star,
  Trophy,
  Shield,
  Zap,
  Target,
  HelpCircle,
  Lightbulb,
  Wifi,
  Bot,
  Coins,
  TrendingUp,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";

const SECTIONS = [
  {
    title: "1. Build Your Squad",
    subtitle: "Tactics start here",
    icon: Shield,
    color: "#3b82f6",
    image: "/how-it-work/squad.png",
    items: [
      "You need exactly 5 players: 1 GK, 1 DEF, 2 MID, 1 FWD",
      "Playing players in their natural position gives best performance",
      "You can change your squad anytime from the Squad page",
      "Your squad rating is the average of all 5 players' overall ratings",
    ],
    tip: "A balanced squad beats a stacked one — don't ignore your defenders!",
  },
  {
    title: "2. Play Matches",
    subtitle: "Two ways to compete",
    icon: Swords,
    color: "#10b981",
    image: "/how-it-work/play.png",
    items: [
      "Bot Match — Play against AI. Instant match, instant rewards",
      "Online PvP — Play against real players in real-time",
      "Both modes cost 5 coins to enter",
      "Matches simulate 90 minutes in seconds",
      "Watch events unfold: goals, saves, chances, and more",
    ],
    tip: "Online PvP has higher rewards but tougher competition!",
  },
  {
    title: "3. Earn Rewards",
    subtitle: "Win coins & level up",
    icon: Coins,
    color: "#e09225",
    image: "/how-it-work/rewards.png",
    items: [
      "Win bonus: +10 coins base",
      "Goals scored: +5 each goal you score",
      "Goals conceded: -1 each goal you let in",
      "Clean sheet: +7 bonus if you concede 0",
      "Draw: 2 coins refund (partial fee recovery)",
      "Loss: 0 coins (entry fee lost)",
    ],
    tip: "A 3-0 win earns you 10 + 15 + 7 = +32 coins (net +27 after fee)!",
  },
  {
    title: "4. Buy & Collect Players",
    subtitle: "Build your dream squad",
    icon: Store,
    color: "#a855f7",
    image: "/how-it-work/shop.png",
    items: [
      "Use coins to buy new player packs from the Shop",
      "Players have different rarities: Common → Rare → Epic → Legendary → Mythic",
      "Higher rarity = higher stats = higher cost",
      "Players unlock when you meet their XP requirement",
      "Once unlocked, you can buy them anytime with coins",
    ],
    tip: "Check the shop often — new players rotate in regularly!",
  },
  {
    title: "5. Upgrade Your Players",
    subtitle: "Make your stars shine",
    icon: TrendingUp,
    color: "#ef4444",
    image: "/how-it-work/upgrade.png",
    items: [
      "Each player has 6 attributes: PAC, SHO, PAS, DRI, DEF, PHY",
      "Upgrade individual attributes using coins",
      "Cost increases as the stat gets higher (50 → 100 → 200 → 500 → 1000)",
      "Players also need XP to upgrade — the higher the stat, the more XP needed",
      "XP is earned from playing matches and never consumed",
    ],
    tip: "Focus on position-key attributes first — upgrade PAC for FWDs, DEF for defenders!",
  },
];

export default function HowToPlayPage() {
  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-3xl mx-auto p-4 md:p-6 space-y-8 pb-20">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#e09225]/10 border-2 border-[#e09225]/30 flex items-center justify-center">
            <HelpCircle className="w-8 h-8 text-[#e09225]" />
          </div>
          <h1 className="text-2xl font-bold text-white">How to Play</h1>
          <p className="text-gray-400 mt-2 max-w-md mx-auto">
            Everything you need to know about TCC Manager — from your first
            squad to your first victory
          </p>
        </motion.div>

        {/* Game Loop Visual */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-linear-to-b from-white/6 to-white/2 rounded-2xl border border-white/10 p-6"
        >
          <h2 className="text-sm font-bold text-white uppercase tracking-wider mb-5 text-center">
            The Game Loop
          </h2>
          <div className="flex flex-wrap items-center justify-center gap-x-2 gap-y-3">
            {[
              { label: "Play Match", icon: Swords, color: "#10b981" },
              { label: "Earn Rewards", icon: Coins, color: "#e09225" },
              { label: "Buy Players", icon: Store, color: "#a855f7" },
              { label: "Upgrade", icon: TrendingUp, color: "#ef4444" },
              { label: "Win More", icon: Trophy, color: "#f59e0b" },
            ].map((step, i) => (
              <div key={step.label} className="flex items-center gap-1">
                <div className="flex flex-col items-center gap-1.5 min-w-16">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{
                      backgroundColor: `${step.color}15`,
                      borderColor: `${step.color}30`,
                      borderWidth: 1,
                    }}
                  >
                    <step.icon
                      className="w-5 h-5"
                      style={{ color: step.color }}
                    />
                  </div>
                  <p className="text-[9px] text-gray-400 text-center leading-tight">
                    {step.label}
                  </p>
                </div>
                {i < 5 && (
                  <ArrowRight className="w-4 h-4 text-gray-600 hidden sm:block" />
                )}
              </div>
            ))}
          </div>
          {/* Progress bar */}
          <div className="flex gap-1.5 mt-5">
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className="flex-1 h-1 rounded-full bg-white/10 overflow-hidden"
              >
                <div
                  className="h-full rounded-full bg-[#e09225]"
                  style={{
                    width: `${(i / 6) * 100}%`,
                    opacity: 0.3 + (i / 6) * 0.7,
                  }}
                />
              </div>
            ))}
          </div>
        </motion.div>

        {/* Bot vs PvP Quick Comparison */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="grid grid-cols-1 sm:grid-cols-2 gap-3"
        >
          {/* Bot */}
          <div className="bg-green-500/4 border border-green-500/20 rounded-xl p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-green-500/10 border border-green-500/20 flex items-center justify-center">
                <Bot className="w-5 h-5 text-green-400" />
              </div>
              <div>
                <p className="text-sm font-bold text-white">Bot Match</p>
                <p className="text-[10px] text-gray-500">vs AI Opponent</p>
              </div>
            </div>
            <div className="space-y-1.5 text-xs text-gray-400">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3 h-3 text-green-400" />
                <span>Instant match, no waiting</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3 h-3 text-green-400" />
                <span>Lower coin rewards</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3 h-3 text-green-400" />
                <span>No internet required after match starts</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3 h-3 text-green-400" />
                <span>XP: Win = 3 · Draw = 2 · Loss = 1</span>
              </div>
            </div>
          </div>
          {/* PvP */}
          <div className="bg-blue-500/4 border border-blue-500/20 rounded-xl p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                <Wifi className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <p className="text-sm font-bold text-white">Online PvP</p>
                <p className="text-[10px] text-gray-500">vs Real Players</p>
              </div>
            </div>
            <div className="space-y-1.5 text-xs text-gray-400">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3 h-3 text-blue-400" />
                <span>Matchmaking finds similar-rated opponents</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3 h-3 text-blue-400" />
                <span>Higher coin & XP rewards</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3 h-3 text-blue-400" />
                <span>Real-time live simulation</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3 h-3 text-blue-400" />
                <span>XP: Win = 5 · Draw = 3 · Loss = 1</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Detailed Sections */}
        <div className="space-y-4">
          {SECTIONS.map((section, i) => (
            <motion.div
              key={section.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + i * 0.08 }}
              className="bg-white/5 rounded-xl border border-white/10 overflow-hidden"
            >
              <div className="p-5">
                {/* Header */}
                <div className="flex items-start gap-4 mb-4">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
                    style={{ backgroundColor: `${section.color}15` }}
                  >
                    <section.icon
                      className="w-6 h-6"
                      style={{ color: section.color }}
                    />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-white font-bold">{section.title}</h3>
                    <p className="text-xs text-gray-500">{section.subtitle}</p>
                  </div>
                </div>

                {/* Image placeholder */}
                <div className="mb-4 rounded-xl overflow-hidden bg-white/2 border border-white/5 aspect-video flex items-center justify-center">
                  <img
                    src={section.image}
                    alt={section.title}
                    className="w-full h-full object-contain"
                    onError={(e) => {
                      const target = e.currentTarget;
                      target.style.display = "none";
                      if (target.parentElement) {
                        target.parentElement.classList.add(
                          "flex",
                          "items-center",
                          "justify-center",
                        );
                        const placeholder = document.createElement("div");
                        placeholder.className =
                          "flex flex-col items-center gap-2 text-gray-600";
                        placeholder.innerHTML = `
                          <div class="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center">
                            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0022.5 18.75V5.25A2.25 2.25 0 0020.25 3H3.75A2.25 2.25 0 001.5 5.25v13.5A2.25 2.25 0 003.75 21z" />
                            </svg>
                          </div>
                          <span class="text-[10px]">Add image</span>
                        `;
                        target.parentElement.appendChild(placeholder);
                      }
                    }}
                  />
                </div>

                {/* Items list */}
                <ul className="space-y-2">
                  {section.items.map((item, j) => (
                    <li
                      key={j}
                      className="text-sm text-gray-300 flex items-start gap-2.5"
                    >
                      <div
                        className="w-1.5 h-1.5 rounded-full mt-2 shrink-0"
                        style={{ backgroundColor: section.color }}
                      />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>

                {/* Tip */}
                <div
                  className="mt-3 flex items-start gap-2 text-xs rounded-lg p-3"
                  style={{
                    backgroundColor: `${section.color}08`,
                    borderColor: `${section.color}15`,
                    borderWidth: 1,
                  }}
                >
                  <Lightbulb
                    className="w-3.5 h-3.5 shrink-0 mt-0.5"
                    style={{ color: section.color }}
                  />
                  <span className="text-gray-400">{section.tip}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Final CTA */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="text-center py-6"
        >
          <div className="w-16 h-16 rounded-full bg-green-500/10 border-2 border-green-500/20 flex items-center justify-center mx-auto mb-4">
            <Swords className="w-8 h-8 text-green-400" />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Ready to Play?</h2>
          <p className="text-gray-400 text-sm mb-5">
            You know the rules — now get out there and win!
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <a
              href="/game/play"
              className="px-8 py-3 bg-green-500 text-[#0a1628] font-bold rounded-xl hover:bg-green-500/90 transition inline-flex items-center gap-2"
            >
              <Bot className="w-4 h-4" />
              Play Bot Match
            </a>
            <a
              href="/game/play/pvp"
              className="px-8 py-3 bg-blue-500 text-white font-bold rounded-xl hover:bg-blue-500/90 transition inline-flex items-center gap-2"
            >
              <Wifi className="w-4 h-4" />
              Play Online PvP
            </a>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
