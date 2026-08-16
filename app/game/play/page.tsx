"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Swords,
  Search,
  Users,
  Shield,
  Zap,
  Clock,
  ArrowRight,
  Loader,
  Bot,
  Coins,
  Info,
} from "lucide-react";
import { useGameUser, useSquad, useStartMatch } from "@/lib/game/hooks/useGameQuery";
import { MATCH_FEE } from "@/lib/game/engine/matchEngine";
import { computeClientSquadRating } from "@/lib/game/utils/clientSquadRating";
import { LoadingState, ErrorState } from "@/app/game/_components";

type MatchState = "idle" | "searching" | "found" | "starting";

export default function PlayPage() {
  const router = useRouter();
  const [matchState, setMatchState] = useState<MatchState>("idle");
  const [searchTime, setSearchTime] = useState(0);

  const { data: userData, isLoading: userLoading, isError: userError } = useGameUser();
  const { data: squadData, isLoading: squadLoading, isError: squadError, refetch: refetchSquad } = useSquad();
  const startMatch = useStartMatch();

  const gameUser = userData?.gameUser;
  const squad = squadData?.squad;
  const searchTimerRef = useRef<NodeJS.Timeout | null>(null);
  const hasStartedMatchRef = useRef(false);

  const loading = userLoading || squadLoading;

  // Search timer for bot mode
  useEffect(() => {
    if (matchState !== "searching") {
      setSearchTime(0);
      if (searchTimerRef.current) {
        clearInterval(searchTimerRef.current);
        searchTimerRef.current = null;
      }
      return;
    }

    searchTimerRef.current = setInterval(() => {
      setSearchTime((t) => {
        if (t >= 3) {
          if (searchTimerRef.current) clearInterval(searchTimerRef.current);
          setMatchState("found");
          return 3;
        }
        return t + 1;
      });
    }, 1000);

    return () => {
      if (searchTimerRef.current) {
        clearInterval(searchTimerRef.current);
        searchTimerRef.current = null;
      }
    };
  }, [matchState]);

  const handleStartSearch = () => {
    if (!squad || !squad.players || squad.players.length !== 5) {
      router.push("/game/squad");
      return;
    }

    if (!gameUser || gameUser.coins < MATCH_FEE) {
      router.push('/game/shop');
      return;
    }

    setMatchState("searching");
  };

  const handleStartMatch = async () => {
    if (hasStartedMatchRef.current) return;
    hasStartedMatchRef.current = true;
    setMatchState("starting");
    try {
      const data = await startMatch.mutateAsync();
      if (data.matchId) {
        // Only the first half is played now — the match page pauses at
        // halftime for a real substitution/formation-change window, then
        // calls /game/match/continue to finish the second half.
        sessionStorage.setItem(
          "lastMatchResult",
          JSON.stringify({
            matchId: data.matchId,
            isFirstHalf: true,
            events: data.firstHalf.events,
          }),
        );
        router.push(`/game/match/${data.matchId}`);
      } else {
        console.error("Match start failed:", data);
        setMatchState("idle");
      }
    } catch (err) {
      console.error(err);
      setMatchState("idle");
    }
  };

  const getPositionIcon = (pos: string) => {
    switch (pos) {
      case "GK": return <Shield className="w-3 h-3" />;
      case "DEF": return <Shield className="w-3 h-3" />;
      case "MID": return <Zap className="w-3 h-3" />;
      case "FWD": return <Swords className="w-3 h-3" />;
      default: return <Users className="w-3 h-3" />;
    }
  };

  // ─── Hooks must be before early returns! ────────────────────────────────
  const ownedPlayers = squadData?.ownedPlayers || [];
  const squadRating = useMemo(
    () => computeClientSquadRating(squad, ownedPlayers),
    [squad, ownedPlayers],
  );

  // Stable opponent rating (computed once when opponent is found)
  const [opponentRating, setOpponentRating] = useState<number | null>(null);
  useEffect(() => {
    if (matchState === "found" && opponentRating === null && squadRating > 0) {
      setOpponentRating(Math.max(60, squadRating + Math.floor(Math.random() * 10) - 5));
    }
    if (matchState === "idle") {
      setOpponentRating(null);
    }
  }, [matchState, squadRating]);

  // ─── Early returns ──────────────────────────────────────────────────────
  if (loading) {
    return <LoadingState text="Getting ready..." />;
  }

  if (userError) {
    return (
      <ErrorState
        title="Failed to load profile"
        message="Could not load your game data"
      />
    );
  }

  if (squadError) {
    return (
      <ErrorState
        title="Failed to load squad"
        message="Could not fetch your squad data"
        onRetry={() => refetchSquad()}
      />
    );
  }

  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-2xl mx-auto p-4 md:p-6 flex flex-col items-center justify-center min-h-full gap-8">
        <AnimatePresence mode="wait">
          {matchState === "idle" && (
            <motion.div
              key="idle-bot"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="w-full space-y-8 text-center"
            >
              {/* Hero */}
              <div>
                <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-linear-to-br from-green-500/20 to-green-600/5 border-2 border-green-500/30 flex items-center justify-center">
                  <Swords className="w-12 h-12 text-green-400" />
                </div>
                <h1 className="text-3xl font-bold text-white mb-2">Quick Match</h1>
                <p className="text-gray-400">Play against the AI. Instant match, instant rewards.</p>
              </div>

              {/* Entry Fee Info */}
              <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2 text-gray-400">
                    <Coins className="w-4 h-4 text-amber-400" />
                    <span>Entry Fee</span>
                  </div>
                  <span className="text-amber-400 font-bold">-{MATCH_FEE} coins</span>
                </div>

                <div className="border-t border-white/5 pt-2">
                  <div className="flex items-center gap-2 text-gray-400 text-sm mb-2">
                    <Swords className="w-4 h-4 text-green-400" />
                    <span>Win reward — how it works</span>
                  </div>
                  <div className="bg-white/[0.02] rounded-lg p-3 space-y-2">
                    {/* Step 1 */}
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className="w-4 h-4 rounded-full bg-green-500/20 text-green-400 text-[9px] font-bold flex items-center justify-center">1</span>
                        <span className="text-gray-400">Base win</span>
                      </div>
                      <span className="text-green-400 font-medium tabular-nums">+10</span>
                    </div>
                    {/* Step 2 */}
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className="w-4 h-4 rounded-full bg-green-500/20 text-green-400 text-[9px] font-bold flex items-center justify-center">2</span>
                        <div>
                          <span className="text-gray-400">Goals scored</span>
                          <span className="text-gray-600 ml-1">× +5</span>
                        </div>
                      </div>
                      <span className="text-green-400 font-medium tabular-nums">+5 each</span>
                    </div>
                    {/* Step 3 */}
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className="w-4 h-4 rounded-full bg-red-500/20 text-red-400 text-[9px] font-bold flex items-center justify-center">3</span>
                        <div>
                          <span className="text-gray-400">Goals conceded</span>
                          <span className="text-gray-600 ml-1">× -1</span>
                        </div>
                      </div>
                      <span className="text-red-400 font-medium tabular-nums">-1 each</span>
                    </div>
                    {/* Step 4 */}
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className="w-4 h-4 rounded-full bg-green-500/20 text-green-400 text-[9px] font-bold flex items-center justify-center">4</span>
                        <div>
                          <span className="text-gray-400">Clean sheet</span>
                          <span className="text-gray-600 ml-1">if 0 conceded</span>
                        </div>
                      </div>
                      <span className="text-green-400 font-medium tabular-nums">+7</span>
                    </div>
                    {/* Formula + Examples */}
                    <div className="border-t border-white/5 pt-2 mt-1 space-y-1.5">
                      <div className="text-[10px] text-gray-500 text-center font-mono">
                        Base + (goals × 5) − (conceded × 1) + (clean? +7 : 0)
                      </div>
                      <div className="grid grid-cols-2 gap-1.5">
                        <div className="bg-white/[0.03] rounded px-2 py-1.5">
                          <div className="text-[9px] text-gray-600 mb-0.5">3-1 win</div>
                          <div className="text-[11px] text-white font-bold tabular-nums">
                            10 + 15 − 1 = <span className="text-green-400">+24</span>
                          </div>
                        </div>
                        <div className="bg-white/[0.03] rounded px-2 py-1.5">
                          <div className="text-[9px] text-gray-600 mb-0.5">2-0 win</div>
                          <div className="text-[11px] text-white font-bold tabular-nums">
                            10 + 10 + 7 = <span className="text-green-400">+27</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm border-t border-white/5 pt-2">
                  <div className="flex items-center gap-2 text-gray-400">
                    <Info className="w-4 h-4 text-gray-500" />
                    <span>Your balance</span>
                  </div>
                  <span className={`font-bold ${(gameUser?.coins || 0) >= MATCH_FEE ? 'text-white' : 'text-red-400'}`}>
                    {gameUser?.coins || 0} coins
                  </span>
                </div>

                {/* Loss info */}
                <div className="text-[10px] text-gray-600 text-center border-t border-white/5 pt-2">
                  Lose: <span className="text-red-400">0 coins</span> (fee lost) · Draw: <span className="text-amber-400">2 coins</span> (partial refund)
                </div>

                {(gameUser?.coins || 0) < MATCH_FEE && (
                  <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-2 text-center">
                    <p className="text-red-400 text-xs">
                      Not enough coins!{' '}
                      <button onClick={() => router.push('/game/shop')} className="underline font-medium hover:text-red-300">
                        Buy coins in shop →
                      </button>
                    </p>
                  </div>
                )}
              </div>

              {/* Squad Preview */}
              {squad && (
                <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                  <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-3">
                    Your Squad
                  </h3>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-gray-400 text-sm">Squad Rating</span>
                    <span className="text-xl font-bold text-white">{squadRating}</span>
                  </div>
                  <div className="grid grid-cols-5 gap-2">
                    {squad.players?.map((p: any, i: number) => (
                      <div key={i} className="text-center">
                        <div className="w-10 h-10 mx-auto rounded-full bg-white/5 overflow-hidden mb-1 border border-white/10">
                          {p.playerId?.image_url && (
                            <img
                              src={p.playerId.image_url}
                              alt={p.playerId.short_name}
                              className="w-full h-full object-cover"
                            />
                          )}
                        </div>
                        <p className="text-[10px] text-gray-300 truncate">{p.playerId?.short_name}</p>
                        <span className="text-[9px] text-gray-500">{p.position}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Start button */}
              <button
                onClick={handleStartSearch}
                disabled={(gameUser?.coins || 0) < MATCH_FEE}
                className="w-full py-5 bg-green-500 text-white font-bold text-lg rounded-xl hover:bg-green-500/90 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
              >
                <Coins className="w-5 h-5" />
                {(gameUser?.coins || 0) >= MATCH_FEE ? `Find Bot Match (${MATCH_FEE} coins)` : 'Not Enough Coins'}
              </button>

              {(!squad || !squad.players || squad.players.length !== 5) && (
                <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4">
                  <p className="text-amber-400 text-sm">
                    You need a complete 5-player squad to play.{' '}
                    <button onClick={() => router.push("/game/squad")} className="underline font-medium">
                      Build your squad
                    </button>
                  </p>
                </div>
              )}
            </motion.div>
          )}

          {matchState === "searching" && (
            <motion.div
              key="searching"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="text-center space-y-6"
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="w-20 h-20 mx-auto rounded-full border-4 border-green-500/30 border-t-green-400 flex items-center justify-center"
              >
                <Search className="w-8 h-8 text-green-400" />
              </motion.div>

              <div>
                <h2 className="text-2xl font-bold text-white mb-2">Finding Opponent</h2>
                <p className="text-gray-400">Simulating opponent squad...</p>
              </div>

              <div className="flex items-center justify-center gap-2 text-gray-500">
                <Clock className="w-4 h-4" />
                <span>{searchTime}s</span>
              </div>

              <button
                onClick={() => setMatchState("idle")}
                className="text-sm text-gray-500 hover:text-white transition"
              >
                Cancel
              </button>
            </motion.div>
          )}

          {(matchState === "found" || matchState === "starting") && (
            <motion.div
              key="found"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="w-full space-y-6 text-center"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", delay: 0.2 }}
                className="w-24 h-24 mx-auto rounded-full bg-linear-to-br from-green-500/20 to-green-600/5 border-2 border-green-400/30 flex items-center justify-center"
              >
                <Users className="w-12 h-12 text-green-400" />
              </motion.div>

              <div>
                <h2 className="text-2xl font-bold text-white mb-1">Opponent Found!</h2>
                <p className="text-gray-400">Get ready for kickoff</p>
              </div>

              <div className="bg-white/5 rounded-xl p-6 border border-white/10">
                <div className="flex items-center justify-between mb-4">
                  <div className="text-center flex-1">
                    <p className="text-lg font-bold text-white">{gameUser?.username}</p>
                    <p className="text-3xl font-bold text-[#e09225]">{squadRating}</p>
                    <p className="text-xs text-gray-500">Squad Rating</p>
                  </div>
                  <div className="text-center px-6">
                    <p className="text-2xl font-bold text-white">vs</p>
                  </div>
                  <div className="text-center flex-1">
                    <p className="text-lg font-bold text-white">Opponent (AI)</p>
                    <p className="text-3xl font-bold text-[#e09225]">
                      {opponentRating ?? "-"}
                    </p>
                    <p className="text-xs text-gray-500">Squad Rating</p>
                  </div>
                </div>

                <div className="flex items-center justify-center gap-2 text-gray-400 text-sm">
                  <Bot className="w-4 h-4" />
                  <span>Bot match • 90 min simulation</span>
                </div>
              </div>

              <button
                onClick={handleStartMatch}
                disabled={matchState === "starting"}
                className="w-full py-5 bg-green-500 text-white font-bold text-lg rounded-xl hover:bg-green-500/90 transition disabled:opacity-50 flex items-center justify-center gap-3"
              >
                {matchState === "starting" ? (
                  <>
                    <Loader className="w-5 h-5 animate-spin" />
                    Starting Match...
                  </>
                ) : (
                  <>
                    <Swords className="w-6 h-6" />
                    Start Match
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
