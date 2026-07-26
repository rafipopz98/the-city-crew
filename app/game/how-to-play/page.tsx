"use client";

import { motion } from "framer-motion";
import { Swords, Store, Library, User, Star, Trophy, Shield, Zap, Target, HelpCircle, Lightbulb } from "lucide-react";

const STEPS = [
  {
    title: "Get Started",
    items: [
      "Choose your username",
      "Receive 5 starter players",
      "Build your first 5-a-side squad",
    ],
    icon: User,
  },
  {
    title: "Build Your Squad",
    items: [
      "You need exactly 5 players: 1 GK, 1 DEF, 2 MID, 1 FWD",
      "Playing players in their natural position gives best performance",
      "You can change your squad anytime from the Squad page",
    ],
    icon: Shield,
  },
  {
    title: "Play Matches",
    items: [
      "Your squad faces an opponent in a 5v5 simulation",
      "Matches last approximately 20-30 seconds",
      "Player attributes and positions affect the outcome",
      "Watch match events unfold in real-time",
    ],
    icon: Swords,
  },
  {
    title: "Earn Rewards",
    items: [
      "Win matches to earn XP and Coins",
      "Even losing gives some rewards",
      "XP represents your manager progression",
      "Coins are used to buy new players",
    ],
    icon: Star,
  },
  {
    title: "Collect Players",
    items: [
      "Buy new players from the Shop using coins",
      "Players unlock when you reach their required XP",
      "XP is never consumed - once unlocked, stays unlocked",
      "Buying players spends coins permanently",
    ],
    icon: Store,
  },
  {
    title: "Rarity & Attributes",
    items: [
      "Players have 6 rarities: Basic → Common → Uncommon → Rare → Epic → Legendary",
      "Higher rarity = higher stats = higher price",
      "Key attributes: Pace, Shooting, Passing, Dribbling, Defending, Physical",
      "Natural position matters - wrong position reduces effectiveness",
    ],
    icon: Trophy,
  },
];

export default function HowToPlayPage() {
  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-3xl mx-auto p-4 md:p-6 space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#e09225]/10 border-2 border-[#e09225]/30 flex items-center justify-center">
            <HelpCircle className="w-8 h-8 text-[#e09225]" />
          </div>
          <h1 className="text-2xl font-bold text-white">How to Play</h1>
          <p className="text-gray-400 mt-2">Everything you need to know about TCC Manager</p>
        </div>

        {/* Game Loop */}
        <div className="bg-white/5 rounded-xl p-6 border border-white/10">
          <h2 className="text-lg font-bold text-white mb-4">The Game Loop</h2>
          <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-4">
            {["Play", "Earn XP", "Earn Coins", "Buy Players", "Build Squad", "Win More"].map((step, i) => (
              <div key={step} className="flex flex-col items-center gap-2 min-w-[70px]">
                <div className="w-10 h-10 rounded-full bg-[#e09225]/10 border border-[#e09225]/30 flex items-center justify-center">
                  <span className="text-[#e09225] font-bold text-sm">{i + 1}</span>
                </div>
                <p className="text-[10px] text-gray-400 text-center leading-tight">{step}</p>
              </div>
            ))}
          </div>
          <div className="hidden sm:flex items-center justify-between gap-3 mt-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex-1 h-0.5 bg-white/10" />
            ))}
          </div>
        </div>

        {/* Steps */}
        <div className="space-y-4">
          {STEPS.map((step, i) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-white/5 rounded-xl p-5 border border-white/10"
            >
              <div className="flex items-center gap-4 mb-3">
                <div className="w-12 h-12 rounded-xl bg-[#e09225]/10 flex items-center justify-center shrink-0">
                  <step.icon className="w-6 h-6 text-[#e09225]" />
                </div>
                <div>
                  <h3 className="text-white font-bold">{step.title}</h3>
                  <p className="text-xs text-gray-500">Step {i + 1}</p>
                </div>
              </div>
              <ul className="space-y-2 ml-16">
                {step.items.map((item, j) => (
                  <li key={j} className="text-sm text-gray-300 flex items-start gap-2">
                    <span className="text-[#e09225] mt-1">•</span>
                    {item}
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>

        {/* Tips */}
        <div className="bg-linear-to-r from-[#e09225]/10 to-transparent rounded-xl p-5 border border-[#e09225]/20">
          <h3 className="text-white font-bold mb-2 flex items-center gap-2"><Lightbulb className="w-5 h-5 text-amber-400" /> Pro Tips</h3>
          <ul className="space-y-2 text-sm text-gray-300">
            <li>• Check the Shop often for new players you can unlock</li>
            <li>• Play players in their natural positions for best performance</li>
            <li>• Build a balanced squad with a GK, DEF, MID, and FWD</li>
            <li>• Complete the squad builder to start playing matches</li>
            <li>• XP and coins accumulate even from losses - keep playing!</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
