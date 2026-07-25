"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Swords, Trophy, Clock, Home, RefreshCw, Zap } from "lucide-react";

interface MatchEvent {
  minute: number;
  type: string;
  description: string;
  playerName: string;
  isUserEvent: boolean;
}

interface MatchResult {
  userScore: number;
  opponentScore: number;
  userPossession: number;
  opponentPossession: number;
  userShots: number;
  opponentShots: number;
  userShotsOnTarget: number;
  opponentShotsOnTarget: number;
  events: MatchEvent[];
  playerOfTheMatch: {
    playerId: string;
    shortName: string;
    team: "user" | "opponent";
  };
  matchResult: "win" | "loss" | "draw";
  rewards: { xp: number; coins: number };
  userRating: number;
  duration_seconds: number;
}

export default function MatchSimulationPage() {
  const { matchId } = useParams();
  const router = useRouter();

  const [matchData, setMatchData] = useState<MatchResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [visibleEvents, setVisibleEvents] = useState<number>(0);
  const [showResult, setShowResult] = useState(false);
  const [gameUser, setGameUser] = useState<any>(null);
  const eventsEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadMatchData();
  }, []);

  const loadMatchData = async () => {
    try {
      // First try sessionStorage (from match start redirect)
      const stored = sessionStorage.getItem("lastMatchResult");
      if (stored) {
        const data = JSON.parse(stored);
        setMatchData(data);
        sessionStorage.removeItem("lastMatchResult");
        startEventAnimation(data.events || []);
        setLoading(false);
        return;
      }

      // Fallback: load from API
      const res = await fetch(`/api/game/match/${matchId}`, {
        credentials: "include",
      });
      const data = await res.json();

      if (res.ok && data.match) {
        const m = data.match;
        const matchResultData: MatchResult = {
          userScore: m.userScore,
          opponentScore: m.opponentScore,
          userPossession: m.userPossession,
          opponentPossession: m.opponentPossession,
          userShots: m.userShots,
          opponentShots: m.opponentShots,
          userShotsOnTarget: m.userShotsOnTarget,
          opponentShotsOnTarget: m.opponentShotsOnTarget,
          events: m.events || [],
          playerOfTheMatch: m.playerOfTheMatch || { playerId: "", shortName: "Unknown", team: "user" },
          matchResult: m.matchResult,
          rewards: m.rewards || { xp: 0, coins: 0 },
          userRating: 0,
          duration_seconds: m.duration_seconds || 30,
        };
        setMatchData(matchResultData);
        setShowResult(true); // Skip animation for reloaded matches
      } else {
        // No match found
        setLoading(false);
      }

      // Also fetch game user
      const userRes = await fetch("/api/game/user", { credentials: "include" });
      const userData = await userRes.json();
      if (userData.gameUser) setGameUser(userData.gameUser);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const startEventAnimation = (events: MatchEvent[]) => {
    let i = 0;
    const interval = setInterval(() => {
      i++;
      setVisibleEvents(i);
      if (i >= events.length) {
        clearInterval(interval);
        setTimeout(() => setShowResult(true), 1500);
      }
    }, 1200);
  };

  const getEventIcon = (type: string) => {
    switch (type) {
      case "goal": return <span className="text-2xl">⚽</span>;
      case "save": return <span className="text-xl">🧤</span>;
      case "chance": return <span className="text-xl">💥</span>;
      case "half_time": case "full_time": return <span className="text-xl">⏱️</span>;
      default: return <span className="text-xl">⚡</span>;
    }
  };

  const getEventColor = (event: MatchEvent) => {
    if (event.type === "full_time") return "text-amber-400";
    if (event.type === "half_time") return "text-gray-400";
    if (event.type === "goal") return event.isUserEvent ? "text-green-400" : "text-red-400";
    return event.isUserEvent ? "text-blue-400" : "text-gray-400";
  };

  const getResultColor = (result: string) => {
    switch (result) {
      case "win": return "text-green-400";
      case "loss": return "text-red-400";
      case "draw": return "text-amber-400";
      default: return "text-white";
    }
  };

  // Auto-redirect to home after result is shown
  useEffect(() => {
    if (!showResult) return;
    const timer = setTimeout(() => {
      router.push("/game/home");
    }, 4000);
    return () => clearTimeout(timer);
  }, [showResult, router]);

  const getResultEmoji = (result: string) => {
    switch (result) {
      case "win": return "🎉";
      case "loss": return "😔";
      case "draw": return "🤝";
      default: return "";
    }
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#e09225] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!matchData) {
    return (
      <div className="h-full flex flex-col items-center justify-center gap-6 p-8">
        <Swords className="w-16 h-16 text-gray-600" />
        <p className="text-gray-400">No active match. Start one from the Play page!</p>
        <button
          onClick={() => router.push("/game/play")}
          className="px-6 py-3 bg-green-500 text-white font-bold rounded-xl"
        >
          Go to Play
        </button>
      </div>
    );
  }

  const events = matchData.events || [];

  return (
    <div className="h-full overflow-y-auto">
      <AnimatePresence mode="wait">
        {!showResult ? (
          <motion.div
            key="simulation"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="max-w-2xl mx-auto p-4 md:p-6"
          >
            {/* Scoreboard */}
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              className="bg-white/5 rounded-2xl p-6 border border-white/10 mb-6"
            >
              <div className="flex items-center justify-between">
                <div className="text-center flex-1">
                  <p className="text-sm text-gray-400 mb-1">{gameUser?.username || "You"}</p>
                  <motion.p
                    key={matchData.userScore}
                    initial={{ scale: 1.5 }}
                    animate={{ scale: 1 }}
                    className="text-5xl font-bold text-white"
                  >
                    {matchData.userScore}
                  </motion.p>
                </div>
                <div className="px-4">
                  <div className="w-1 h-16 bg-white/10 rounded-full" />
                </div>
                <div className="text-center flex-1">
                  <p className="text-sm text-gray-400 mb-1">Opponent</p>
                  <motion.p
                    key={matchData.opponentScore}
                    initial={{ scale: 1.5 }}
                    animate={{ scale: 1 }}
                    className="text-5xl font-bold text-white"
                  >
                    {matchData.opponentScore}
                  </motion.p>
                </div>
              </div>
              <div className="flex items-center justify-center gap-2 mt-2">
                <Clock className="w-3 h-3 text-gray-500" />
                <span className="text-xs text-gray-500">
                  Simulating... ({matchData.duration_seconds}s)
                </span>
              </div>
            </motion.div>

            {/* Match Events */}
            <div className="space-y-2">
              {events.slice(0, visibleEvents).map((event, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: event.isUserEvent ? -20 : 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3 }}
                  className={`flex items-start gap-3 p-3 rounded-xl ${
                    event.type === "goal" ? "bg-white/5 border border-white/10" : ""
                  }`}
                >
                  <div className="flex items-center gap-1.5 shrink-0 w-16">
                    <span className="text-xs font-bold text-gray-500">{event.minute}'</span>
                  </div>
                  <div className="shrink-0">{getEventIcon(event.type)}</div>
                  <p className={`text-sm ${getEventColor(event)}`}>{event.description}</p>
                </motion.div>
              ))}
              <div ref={eventsEndRef} />
            </div>

            {visibleEvents < events.length && (
              <div className="flex items-center justify-center gap-2 py-4 text-gray-500">
                <div className="w-2 h-2 rounded-full bg-[#e09225] animate-pulse" />
                <span className="text-xs">Match in progress...</span>
              </div>
            )}
          </motion.div>
        ) : (
          <motion.div
            key="result"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-2xl mx-auto p-4 md:p-6 space-y-6"
          >
            {/* Result Header */}
            <div className="text-center">
              <div className="text-6xl mb-4">{getResultEmoji(matchData.matchResult)}</div>
              <h1 className={`text-4xl font-bold ${getResultColor(matchData.matchResult)} uppercase`}>
                {matchData.matchResult === "win" ? "Victory!" : matchData.matchResult === "loss" ? "Defeat" : "Draw"}
              </h1>
              <p className="text-gray-400 mt-2">Match Complete</p>
            </div>

            {/* Final Score */}
            <div className="bg-white/5 rounded-2xl p-8 border border-white/10">
              <div className="flex items-center justify-between">
                <div className="text-center flex-1">
                  <p className="text-sm text-gray-400 mb-1">{gameUser?.username || "You"}</p>
                  <p className="text-6xl font-bold text-white">{matchData.userScore}</p>
                </div>
                <div className="text-center px-6">
                  <p className="text-lg font-bold text-gray-500">FINAL</p>
                </div>
                <div className="text-center flex-1">
                  <p className="text-sm text-gray-400 mb-1">Opponent</p>
                  <p className="text-6xl font-bold text-white">{matchData.opponentScore}</p>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="bg-white/5 rounded-xl p-4 border border-white/10 space-y-3">
              <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wider">Match Stats</h3>
              <StatRow label="Possession" left={matchData.userPossession} right={matchData.opponentPossession} showPercent />
              <StatRow label="Shots" left={matchData.userShots} right={matchData.opponentShots} />
              <StatRow label="Shots on Target" left={matchData.userShotsOnTarget} right={matchData.opponentShotsOnTarget} />
            </div>

            {/* Rewards */}
            <div className="bg-linear-to-r from-[#e09225]/20 to-[#e09225]/5 rounded-xl p-6 border border-[#e09225]/20">
              <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-4">Rewards Saved ✓</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <div className="flex items-center justify-center gap-2 mb-1">
                    <Zap className="w-5 h-5 text-[#e09225]" />
                    <span className="text-3xl font-bold text-white">+{matchData.rewards.xp}</span>
                  </div>
                  <p className="text-xs text-gray-500">XP Earned</p>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center gap-2 mb-1">
                    <Trophy className="w-5 h-5 text-amber-400" />
                    <span className="text-3xl font-bold text-white">+{matchData.rewards.coins}</span>
                  </div>
                  <p className="text-xs text-gray-500">Coins Earned</p>
                </div>
              </div>
            </div>

            {/* Auto-redirecting to home */}
            <div className="text-center">
              <p className="text-gray-500 text-sm">Returning to home...</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function StatRow({ label, left, right, showPercent }: { label: string; left: number; right: number; showPercent?: boolean }) {
  const total = left + right;
  const leftPercent = total > 0 ? (left / total) * 100 : 50;

  return (
    <div>
      <div className="flex items-center justify-between text-xs text-gray-400 mb-1">
        <span className="font-bold text-white">{left}{showPercent ? '%' : ''}</span>
        <span>{label}</span>
        <span className="font-bold text-white">{right}{showPercent ? '%' : ''}</span>
      </div>
      <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden flex">
        <div className="h-full bg-green-500 rounded-l-full" style={{ width: `${leftPercent}%` }} />
        <div className="h-full bg-red-500 rounded-r-full" style={{ width: `${100 - leftPercent}%` }} />
      </div>
    </div>
  );
}
