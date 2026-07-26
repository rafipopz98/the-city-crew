"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Swords, Trophy, Clock, Zap, Target, Shield, Award, Frown, Handshake } from "lucide-react";
import { ErrorState, SkeletonMatchDetail } from "@/app/game/_components";

interface MatchEvent {
  minute: number;
  type: string;
  description: string;
  playerName: string;
  isUserEvent: boolean;
  actorName?: string;
}

interface RewardBreakdown {
  goalsScored: number;
  goalsConceded: number;
  cleanSheet: boolean;
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
  feeDeducted?: number;
  breakdown?: RewardBreakdown;
}

export default function MatchSimulationPage() {
  const { matchId } = useParams();
  const router = useRouter();

  const [matchData, setMatchData] = useState<MatchResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [visibleEvents, setVisibleEvents] = useState<number>(0);
  const [showResult, setShowResult] = useState(false);
  const [liveUserScore, setLiveUserScore] = useState(0);
  const [liveOpponentScore, setLiveOpponentScore] = useState(0);
  const [gameUser, setGameUser] = useState<any>(null);
  const eventsEndRef = useRef<HTMLDivElement>(null);
  const loadedRef = useRef(false);
  const cameFromMatch = useRef(false);
  const [isHistoryView, setIsHistoryView] = useState(false);

  useEffect(() => {
    if (loadedRef.current) return;
    loadedRef.current = true;
    loadMatchData();
  }, []);

  const loadMatchData = async () => {
    try {
      // First try sessionStorage (from match start redirect)
      const stored = sessionStorage.getItem("lastMatchResult");
      if (stored) {
        cameFromMatch.current = true;
        const data = JSON.parse(stored);
        setMatchData(data);
        sessionStorage.removeItem("lastMatchResult");
        startEventAnimation(data.events || []);
        setLoading(false);
        return;
      }

      // Not from match — viewing from history
      setIsHistoryView(true);

      // Load from API
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
      } else if (res.ok) {
        // No match found
        setLoading(false);
      } else {
        setLoadError(data.message || "Could not load this match. Please try again.");
      }

      // Also fetch game user
      const userRes = await fetch("/api/game/user", { credentials: "include" });
      const userData = await userRes.json();
      if (userData.gameUser) setGameUser(userData.gameUser);
    } catch (err) {
      console.error(err);
      setLoadError("Could not load this match. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Derive live scores from visible goal events
  useEffect(() => {
    if (!matchData) return;
    const visible = matchData.events.slice(0, visibleEvents);
    let user = 0, opponent = 0;
    for (const ev of visible) {
      if (ev.type === "goal") {
        if (ev.isUserEvent) user++;
        else opponent++;
      }
    }
    setLiveUserScore(user);
    setLiveOpponentScore(opponent);
  }, [visibleEvents, matchData]);

  const startEventAnimation = (events: MatchEvent[]) => {
    let i = 0;
    const interval = setInterval(() => {
      i++;
      setVisibleEvents(i);
      if (i >= events.length) {
        clearInterval(interval);
        setTimeout(() => setShowResult(true), 1500);
      }
    }, 1500);
  };

  const getResultColor = (result: string) => {
    switch (result) {
      case "win": return "text-green-400";
      case "loss": return "text-red-400";
      case "draw": return "text-amber-400";
      default: return "text-white";
    }
  };

  // Auto-redirect to home ONLY after a freshly played match, not when viewing history
  useEffect(() => {
    if (!showResult || !cameFromMatch.current) return;
    const timer = setTimeout(() => {
      router.push("/game/home");
    }, 4000);
    return () => clearTimeout(timer);
  }, [showResult, router]);

  const getResultIcon = (result: string) => {
    switch (result) {
      case "win": return <Award className="w-14 h-14 text-green-400" />;
      case "loss": return <Frown className="w-14 h-14 text-red-400" />;
      case "draw": return <Handshake className="w-14 h-14 text-amber-400" />;
      default: return null;
    }
  };

  if (loading) {
    return (
      <div className="h-full overflow-y-auto">
        <SkeletonMatchDetail />
      </div>
    );
  }

  if (loadError) {
    return (
      <ErrorState
        title="Failed to load match"
        message={loadError}
        onRetry={() => window.location.reload()}
      />
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
    <div className="h-full flex flex-col">
      <AnimatePresence mode="wait">          {!showResult ? (
          <motion.div
            key="simulation"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col h-full"
          >
            {/* ── Fixed Scoreboard ── */}
            <div className="shrink-0 bg-[#0a1628] border-b border-white/5 px-4 md:px-6 py-4">
              <div className="max-w-2xl mx-auto space-y-2">
                <div className="bg-gradient-to-b from-white/[0.06] to-white/[0.02] rounded-2xl border border-white/10 p-4 md:p-5">
                  <div className="flex items-center justify-between">
                    {/* Home team */}
                    <div className="text-center flex-1 min-w-0">
                      <p className="text-[11px] font-medium text-gray-500 uppercase tracking-wider truncate">
                        {gameUser?.username || "You"}
                      </p>
                      <p className="text-4xl md:text-5xl font-extrabold text-white mt-1 leading-none">
                        {liveUserScore}
                      </p>
                    </div>

                    {/* Center divider + time */}
                    <div className="flex flex-col items-center px-3 md:px-6">
                      <div className="flex items-center gap-1.5 text-[10px] text-gray-500 mb-2">
                        <Clock className="w-3 h-3" />
                        <span>LIVE</span>
                      </div>
                      <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
                        <span className="text-xs font-bold text-gray-400">vs</span>
                      </div>
                    </div>

                    {/* Away team */}
                    <div className="text-center flex-1 min-w-0">
                      <p className="text-[11px] font-medium text-gray-500 uppercase tracking-wider truncate">
                        Opponent
                      </p>
                      <p className="text-4xl md:text-5xl font-extrabold text-white mt-1 leading-none">
                        {liveOpponentScore}
                      </p>
                    </div>
                  </div>
                </div>
                {/* Disconnect warning */}
                <div className="flex items-center justify-center gap-1.5 text-[10px] text-amber-500/70 bg-amber-500/[0.04] border border-amber-500/10 rounded-lg px-3 py-1.5">
                  <span className="text-amber-500/80">⚠</span>
                  <span>Don&apos;t leave this screen — leaving forfeits the match and you lose your coins.</span>
                </div>
              </div>
            </div>

            {/* ── Scrollable Events ── */}
            <div className="flex-1 overflow-y-auto px-4 md:px-6">
              <div className="max-w-2xl mx-auto py-4 space-y-1.5">
                {/* Timeline line */}
                <div className="relative">
                  {/* Vertical timeline line */}
                  <div className="absolute left-[25px] top-0 bottom-0 w-px bg-gradient-to-b from-green-500/30 via-white/5 to-white/5" />

                  {[...events]
                    .sort((a, b) => a.minute - b.minute)
                    .slice(0, visibleEvents)
                    .map((event, i) => {
                    const actorName = event.actorName || (event.isUserEvent ? "user" : "opponent");
                    const isGoal = event.type === "goal";
                    const isUserEvent_bool = actorName === "user";
                    
                    return (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -15 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.35, ease: "easeOut" }}
                        className={`relative flex items-start gap-3 pl-[50px] py-2.5 ${
                          isGoal
                            ? isUserEvent_bool
                              ? "bg-green-500/[0.04] rounded-xl"
                              : "bg-red-500/[0.04] rounded-xl"
                            : ""
                        }`}
                      >
                        {/* Timeline dot */}
                        <div className={`absolute left-[19px] top-3.5 w-3 h-3 rounded-full border-2 ${
                          isGoal
                            ? isUserEvent_bool
                              ? "bg-green-400 border-green-400/30"
                              : "bg-red-400 border-red-400/30"
                            : "bg-white/10 border-white/5"
                        }`}>
                          {isGoal && (
                            <div className="absolute inset-0 rounded-full animate-ping opacity-30" 
                              style={{ backgroundColor: isUserEvent_bool ? "#22c55e" : "#ef4444" }}
                            />
                          )}
                        </div>

                        {/* Minute */}
                        <div className="shrink-0 w-10 text-right">
                          <span className={`text-xs font-bold tabular-nums ${
                            isGoal ? "text-white" : "text-gray-600"
                          }`}>
                            {event.minute}'
                          </span>
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className={`flex items-start gap-2 ${
                            isGoal ? "bg-green-500/[0.06] p-2 rounded-lg border border-green-500/10" : ""
                          }`}>
                            {/* Icon */}
                            <span className="shrink-0 mt-0.5">
                              {event.type === "goal" ? (
                                <div className="w-5 h-5 rounded-full bg-green-500/20 flex items-center justify-center">
                                  <Target className="w-3 h-3 text-green-400" />
                                </div>
                              ) : event.type === "save" ? (
                                <Shield className="w-4 h-4 text-blue-400" />
                              ) : event.type === "half_time" || event.type === "full_time" ? (
                                <Clock className="w-4 h-4 text-gray-500" />
                              ) : (
                                <Zap className="w-4 h-4 text-amber-400/60" />
                              )}
                            </span>

                            {/* Description */}
                            <p className={`text-sm leading-snug ${
                              isGoal ? "text-white font-medium" : "text-gray-400"
                            }`}>
                              {event.description}
                            </p>
                          </div>
                        </div>

                        {/* Team badge */}
                        {actorName && (
                          <span className={`shrink-0 text-[9px] font-bold px-1.5 py-0.5 rounded-md mt-0.5 ${
                            actorName === "user"
                              ? "bg-green-500/15 text-green-400"
                              : "bg-red-500/15 text-red-400"
                          }`}>
                            {actorName === "user" ? "YOU" : "OPP"}
                          </span>
                        )}
                      </motion.div>
                    );
                  })}
                </div>

                <div ref={eventsEndRef} />

                {/* Loading indicator */}
                {visibleEvents < events.length && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex items-center justify-center gap-2.5 py-6"
                  >
                    <div className="flex gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#e09225] animate-bounce" style={{ animationDelay: "0ms" }} />
                      <span className="w-1.5 h-1.5 rounded-full bg-[#e09225] animate-bounce" style={{ animationDelay: "150ms" }} />
                      <span className="w-1.5 h-1.5 rounded-full bg-[#e09225] animate-bounce" style={{ animationDelay: "300ms" }} />
                    </div>
                    <span className="text-xs text-gray-500 font-medium">Match in progress...</span>
                  </motion.div>
                )}
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="result"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            className="overflow-y-auto"
          >
          <div className="max-w-2xl mx-auto p-4 md:p-6 space-y-6">
            {/* Result Header */}
            <div className="text-center">
              <div className="mb-4 flex justify-center">{getResultIcon(matchData.matchResult)}</div>
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
              <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-4">Rewards</h3>
              
              {/* XP */}
              <div className="flex items-center justify-between py-2 border-b border-white/5 mb-3">
                <div className="flex items-center gap-2 text-gray-400">
                  <Zap className="w-4 h-4 text-[#e09225]" />
                  <span className="text-sm">XP Earned</span>
                </div>
                <span className="text-xl font-bold text-white">+{matchData.rewards.xp}</span>
              </div>

              {/* Coin breakdown */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2 text-gray-400">
                    <Trophy className="w-4 h-4 text-amber-400" />
                    <span>Entry Fee</span>
                  </div>
                  <span className="text-red-400 font-medium">-{matchData.feeDeducted || 5}</span>
                </div>

                {matchData.matchResult === "win" && (
                  <>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-400">Scoreline</span>
                      <span className="text-green-400 font-medium">{matchData.userScore} – {matchData.opponentScore}</span>
                    </div>
                    {matchData.opponentScore === 0 && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-400">Clean Sheet Bonus</span>
                        <span className="text-green-400 font-medium">✓</span>
                      </div>
                    )}
                  </>
                )}

                {matchData.matchResult === "draw" && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">Draw — Fee partially refunded</span>
                    <span className="text-amber-400 font-medium">+{matchData.rewards.coins}</span>
                  </div>
                )}

                {matchData.matchResult === "loss" && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">Loss — Entry fee lost</span>
                    <span className="text-red-400 font-medium">0</span>
                  </div>
                )}

                <div className="flex items-center justify-between pt-2 border-t border-white/10 mt-2">
                  <span className="text-sm font-medium text-gray-300">Net Coins</span>
                  <span className={`text-lg font-bold ${matchData.rewards.coins > 0 ? 'text-green-400' : matchData.rewards.coins < 0 ? 'text-red-400' : 'text-gray-400'}`}>
                    {matchData.rewards.coins > 0 ? '+' : ''}{matchData.rewards.coins}
                  </span>
                </div>
              </div>
            </div>

            {/* Auto-redirecting to home or back to history */}
            <div className="text-center">
              {isHistoryView ? (
                <button
                  onClick={() => router.push("/game/history")}
                  className="text-[#e09225] text-sm font-medium hover:underline inline-flex items-center gap-1"
                >
                  ← Back to History
                </button>
              ) : (
                <p className="text-gray-500 text-sm">Returning to home...</p>
              )}
            </div>
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
