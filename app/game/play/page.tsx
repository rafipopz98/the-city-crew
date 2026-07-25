"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Swords,
  Search,
  Users,
  Shield,
  Zap,
  Trophy,
  Clock,
  ArrowRight,
  Loader,
  Wifi,
  Bot,
  Globe,
} from "lucide-react";
import { useGameUser, useSquad, useStartMatch } from "@/lib/game/hooks/useGameQuery";
import { LoadingState, ErrorState } from "@/app/game/_components";

type MatchState = "idle" | "searching" | "found" | "starting";
type MatchMode = "bot" | "pvp";

export default function PlayPage() {
  const router = useRouter();
  const [matchState, setMatchState] = useState<MatchState>("idle");
  const [matchMode, setMatchMode] = useState<MatchMode>("bot");
  const [searchTime, setSearchTime] = useState(0);

  const { data: userData, isLoading: userLoading, isError: userError } = useGameUser();
  const { data: squadData, isLoading: squadLoading, isError: squadError, refetch: refetchSquad } = useSquad();
  const startMatch = useStartMatch();

  const gameUser = userData?.gameUser;
  const squad = squadData?.squad;
  const searchTimerRef = useRef<NodeJS.Timeout | null>(null);

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
        if (t >= 5) {
          if (searchTimerRef.current) clearInterval(searchTimerRef.current);
          setMatchState("found");
          return 5;
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

    if (matchMode === "pvp") {
      router.push("/game/play/pvp");
      return;
    }

    setMatchState("searching");
  };

  const handleStartMatch = async () => {
    setMatchState("starting");
    try {
      const data = await startMatch.mutateAsync();
      if (data.matchId) {
        sessionStorage.setItem("lastMatchResult", JSON.stringify(data.result));
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

  const squadRating = squad?.players?.length
    ? Math.round(
        squad.players.reduce((sum: number, p: any) => sum + (p.playerId?.overall || 0), 0) /
          squad.players.length,
      )
    : 0;

  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-2xl mx-auto p-4 md:p-6 flex flex-col items-center justify-center min-h-full gap-8">
        {/* Mode Toggle */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex gap-2 bg-white/5 p-1.5 rounded-xl border border-white/10"
        >
          <button
            onClick={() => setMatchMode("bot")}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-bold transition-all ${
              matchMode === "bot"
                ? "bg-[#e09225] text-[#0a1628] shadow-lg"
                : "text-gray-400 hover:text-white"
            }`}
          >
            <Bot className="w-4 h-4" />
            Quick Match (Bot)
          </button>
          <button
            onClick={() => setMatchMode("pvp")}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-bold transition-all ${
              matchMode === "pvp"
                ? "bg-green-500 text-white shadow-lg"
                : "text-gray-400 hover:text-white"
            }`}
          >
            <Globe className="w-4 h-4" />
            Online (PvP)
          </button>
        </motion.div>

        <AnimatePresence mode="wait">
          {matchState === "idle" && matchMode === "bot" && (
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
                className="w-full py-5 bg-green-500 text-white font-bold text-lg rounded-xl hover:bg-green-500/90 transition flex items-center justify-center gap-3"
              >
                <Bot className="w-6 h-6" />
                Find Bot Match
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

          {matchState === "idle" && matchMode === "pvp" && (
            <motion.div
              key="idle-pvp"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="w-full space-y-8 text-center"
            >
              <div>
                <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-linear-to-br from-blue-500/20 to-blue-600/5 border-2 border-blue-500/30 flex items-center justify-center">
                  <Wifi className="w-12 h-12 text-blue-400" />
                </div>
                <h1 className="text-3xl font-bold text-white mb-2">Online Match</h1>
                <p className="text-gray-400">Play against real opponents in real-time.</p>
              </div>

              <div className="bg-blue-500/5 rounded-xl p-4 border border-blue-500/20 space-y-3 text-left">
                <h3 className="text-sm font-medium text-blue-400 uppercase tracking-wider">How it works</h3>
                <div className="flex items-start gap-3 text-sm text-gray-300">
                  <div className="w-6 h-6 rounded-full bg-blue-500/10 flex items-center justify-center shrink-0 mt-0.5">
                    <span className="text-blue-400 text-xs font-bold">1</span>
                  </div>
                  <p>Enter the matchmaking queue</p>
                </div>
                <div className="flex items-start gap-3 text-sm text-gray-300">
                  <div className="w-6 h-6 rounded-full bg-blue-500/10 flex items-center justify-center shrink-0 mt-0.5">
                    <span className="text-blue-400 text-xs font-bold">2</span>
                  </div>
                  <p>Get matched with a similar-rated opponent</p>
                </div>
                <div className="flex items-start gap-3 text-sm text-gray-300">
                  <div className="w-6 h-6 rounded-full bg-blue-500/10 flex items-center justify-center shrink-0 mt-0.5">
                    <span className="text-blue-400 text-xs font-bold">3</span>
                  </div>
                  <p>Watch the match simulation live together</p>
                </div>
                <div className="flex items-start gap-3 text-sm text-gray-300">
                  <div className="w-6 h-6 rounded-full bg-blue-500/10 flex items-center justify-center shrink-0 mt-0.5">
                    <span className="text-blue-400 text-xs font-bold">4</span>
                  </div>
                  <p>Earn rewards based on the result</p>
                </div>
              </div>

              <button
                onClick={handleStartSearch}
                className="w-full py-5 bg-blue-500 text-white font-bold text-lg rounded-xl hover:bg-blue-500/90 transition flex items-center justify-center gap-3"
              >
                <Globe className="w-6 h-6" />
                Find Online Match
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

          {matchState === "searching" && matchMode === "bot" && (
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

          {(matchState === "found" || matchState === "starting") && matchMode === "bot" && (
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
                      {Math.max(60, squadRating + Math.floor(Math.random() * 10) - 5)}
                    </p>
                    <p className="text-xs text-gray-500">Squad Rating</p>
                  </div>
                </div>

                <div className="flex items-center justify-center gap-2 text-gray-400 text-sm">
                  <Bot className="w-4 h-4" />
                  <span>Bot match • 25 min simulation</span>
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
