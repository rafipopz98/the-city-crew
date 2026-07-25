"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Wifi,
  Search,
  Users,
  Shield,
  Zap,
  Swords,
  Clock,
  Loader,
  Trophy,
  User,
  Home,
  RefreshCw,
  AlertTriangle,
  ArrowLeft,
} from "lucide-react";
import { useSocket } from "@/lib/game/socket/client";
import type { ServerMessage } from "@/lib/game/socket/protocol";

interface MatchSocketEvent {
  minute: number;
  type: "attack" | "chance" | "goal" | "save" | "half_time" | "full_time" | "possession";
  description: string;
  actorName: string;
}

interface MatchSocketResult {
  matchId: string;
  homeScore: number;
  awayScore: number;
  homePossession: number;
  awayPossession: number;
  homeShots: number;
  awayShots: number;
  homeShotsOnTarget: number;
  awayShotsOnTarget: number;
  events: MatchSocketEvent[];
  playerOfTheMatch: string;
  winner: "home" | "away" | "draw";
  homeRewards: { xp: number; coins: number };
  awayRewards: { xp: number; coins: number };
}

type PvPState = "loading" | "no_squad" | "connecting" | "queue" | "found" | "countdown" | "playing" | "result" | "error";

export default function PvPPage() {
  const router = useRouter();
  const { connected, registerListeners, joinQueue, leaveQueue } = useSocket();
  const [pvpState, setPvpState] = useState<PvPState>("loading");
  const [gameUser, setGameUser] = useState<any>(null);
  const [squad, setSquad] = useState<any>(null);
  const [queuePosition, setQueuePosition] = useState(0);
  const [opponent, setOpponent] = useState<{ username: string; squadRating: number } | null>(null);
  const [playerSide, setPlayerSide] = useState<"home" | "away">("home");
  const [matchId, setMatchId] = useState<string | null>(null);
  const [countdownNum, setCountdownNum] = useState(3);
  const [events, setEvents] = useState<MatchSocketEvent[]>([]);
  const [matchResult, setMatchResult] = useState<MatchSocketResult | null>(null);
  const [queueTime, setQueueTime] = useState(0);
  const [matchScore, setMatchScore] = useState({ home: 0, away: 0 });
  const [errorMsg, setErrorMsg] = useState("");
  const [savingRewards, setSavingRewards] = useState(false);
  const hasJoinedRef = useRef(false);
  const eventsEndRef = useRef<HTMLDivElement>(null);

  // Load user data and validate squad
  useEffect(() => {
    Promise.all([
      fetch("/api/game/user", { credentials: "include" }).then((r) => r.json()),
      fetch("/api/game/squad", { credentials: "include" }).then((r) => r.json()),
    ])
      .then(([userData, squadData]) => {
        if (!userData.gameUser) {
          router.push("/game/onboarding");
          return;
        }
        setGameUser(userData.gameUser);

        const sq = squadData.squad;
        if (!sq || !sq.players || sq.players.length !== 5) {
          setPvpState("no_squad");
          return;
        }
        setSquad(sq);
        setPvpState("connecting");
      })
      .catch(() => {
        setPvpState("error");
        setErrorMsg("Failed to load profile");
      });
  }, [router]);

  // Auto-join queue when connected
  useEffect(() => {
    if (!connected || !gameUser || !squad || hasJoinedRef.current) return;
    if (pvpState !== "connecting" && pvpState !== "queue") return;

    const rating = Math.round(
      squad.players.reduce((sum: number, p: any) => sum + (p.playerId?.overall || 0), 0) /
        squad.players.length,
    );

    const playerNames = squad.players.map((p: any) => p.playerId?.short_name || "Player");

    hasJoinedRef.current = true;
    setPvpState("queue");
    setQueueTime(0);

    joinQueue({
      userId: gameUser.userId || gameUser._id,
      squadRating: rating,
      username: gameUser.username,
      squadPlayers: playerNames,
    }).catch((err) => {
      console.error("Queue join failed:", err);
      hasJoinedRef.current = false;
      setPvpState("error");
      setErrorMsg("Could not connect to the game server. Make sure the socket server is running.");
    });
  }, [connected, gameUser, squad, pvpState, joinQueue]);

  // Queue timer
  useEffect(() => {
    if (pvpState !== "queue") {
      setQueueTime(0);
      return;
    }
    const interval = setInterval(() => setQueueTime((t) => t + 1), 1000);
    return () => clearInterval(interval);
  }, [pvpState]);

  // Queue timeout (30 seconds)
  useEffect(() => {
    if (pvpState !== "queue" || queueTime < 30) return;
    leaveQueue();
    hasJoinedRef.current = false;
    setPvpState("error");
    setErrorMsg(
      "Could not find an opponent. This can happen if:\n" +
      "• No other players are online right now\n" +
      "• You and your friend are on different server regions\n" +
      "Try again or play a Bot match instead."
    );
  }, [queueTime, pvpState, leaveQueue]);

  // Socket connection timeout
  useEffect(() => {
    if (pvpState !== "connecting") return;
    const timeout = setTimeout(() => {
      if (!connected) {
        setPvpState("error");
        setErrorMsg(
          "Could not connect to the game server. Make sure to run the socket server:\n" +
          "npm run socket",
        );
      }
    }, 5000);
    return () => clearTimeout(timeout);
  }, [pvpState, connected]);

  // Register socket listeners
  useEffect(() => {
    const cleanup = registerListeners((message: ServerMessage) => {
      switch (message.type) {
        case "matchmaking:waiting":
          setQueuePosition(message.payload.position);
          break;

        case "matchmaking:found":
          setMatchId(message.payload.matchId);
          setOpponent(message.payload.opponent);
          setPlayerSide(message.payload.playerSide);
          setPvpState("found");
          break;

        case "match:countdown":
          setCountdownNum(message.payload.seconds);
          if (message.payload.seconds >= 0) {
            setPvpState("countdown");
          }
          break;

        case "match:event": {
          const event = message.payload;
          setEvents((prev) => {
            const updated = [...prev, event];
            if (event.type === "goal") {
              const homeGoals = updated.filter(
                (e) => e.type === "goal" && e.actorName === "home",
              ).length;
              const awayGoals = updated.filter(
                (e) => e.type === "goal" && e.actorName === "away",
              ).length;
              setMatchScore({ home: homeGoals, away: awayGoals });
            }
            return updated;
          });
          setPvpState("playing");
          break;
        }

        case "match:end":
          setMatchResult(message.payload);
          setPvpState("result");
          savePvPRewards(message.payload);
          break;

        case "match:error":
          setPvpState("error");
          setErrorMsg(message.payload.message || "Match error occurred");
          hasJoinedRef.current = false;
          break;
      }
    });

    return cleanup;
  }, [registerListeners, playerSide, opponent]);

  // Scroll to latest event
  useEffect(() => {
    eventsEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [events]);

  // Auto-redirect to home after rewards are saved
  useEffect(() => {
    if (pvpState !== "result" || savingRewards) return;
    const timer = setTimeout(() => {
      router.push("/game/home");
    }, 3500);
    return () => clearTimeout(timer);
  }, [pvpState, savingRewards, router]);

  // Save PvP rewards to backend
  const savePvPRewards = async (result: MatchSocketResult) => {
    setSavingRewards(true);
    try {
      const isHome = playerSide === "home";
      const rewards = isHome ? result.homeRewards : result.awayRewards;

      await fetch("/api/game/match/pvp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          matchId: result.matchId,
          opponentName: opponent?.username || "Opponent",
          userScore: isHome ? result.homeScore : result.awayScore,
          opponentScore: isHome ? result.awayScore : result.homeScore,
          userPossession: isHome ? result.homePossession : result.awayPossession,
          opponentPossession: isHome ? result.awayPossession : result.homePossession,
          userShots: isHome ? result.homeShots : result.awayShots,
          opponentShots: isHome ? result.awayShots : result.homeShots,
          userShotsOnTarget: isHome ? result.homeShotsOnTarget : result.awayShotsOnTarget,
          opponentShotsOnTarget: isHome ? result.awayShotsOnTarget : result.homeShotsOnTarget,
          xpEarned: rewards.xp,
          coinsEarned: rewards.coins,
          result: isHome ? result.winner === "home" ? "win" : result.winner === "away" ? "loss" : "draw"
                  : result.winner === "away" ? "win" : result.winner === "home" ? "loss" : "draw",
          events: result.events,
          playerOfTheMatch: result.playerOfTheMatch,
        }),
      });
    } catch (err) {
      console.error("Failed to save PvP rewards:", err);
    } finally {
      setSavingRewards(false);
    }
  };

  // Cancel queue
  const handleCancel = () => {
    leaveQueue();
    hasJoinedRef.current = false;
    router.push("/game/play");
  };

  const squadRating = squad?.players?.length
    ? Math.round(
        squad.players.reduce((sum: number, p: any) => sum + (p.playerId?.overall || 0), 0) /
          squad.players.length,
      )
    : 0;

  const getEventIcon = (type: string) => {
    switch (type) {
      case "goal": return <span className="text-2xl">⚽</span>;
      case "save": return <span className="text-xl">🧤</span>;
      case "chance": return <span className="text-xl">💥</span>;
      case "half_time": case "full_time": return <span className="text-xl">⏱️</span>;
      default: return <span className="text-xl">⚡</span>;
    }
  };

  const getResultEmoji = (winner: string) => {
    if (winner === "draw") return "🤝";
    const myResult = playerSide === "home"
      ? winner === "home" ? "win" : "loss"
      : winner === "away" ? "win" : "loss";
    return myResult === "win" ? "🎉" : "😔";
  };

  const getResultText = (winner: string) => {
    if (winner === "draw") return "Draw";
    const myResult = playerSide === "home"
      ? winner === "home" ? "win" : "loss"
      : winner === "away" ? "win" : "loss";
    return myResult === "win" ? "Victory!" : "Defeat";
  };

  const myScore = playerSide === "home" ? matchScore.home : matchScore.away;
  const opScore = playerSide === "home" ? matchScore.away : matchScore.home;

  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-2xl mx-auto p-4 md:p-6">
        <AnimatePresence mode="wait">
          {/* Loading */}
          {pvpState === "loading" && (
            <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center min-h-[60vh] gap-4"
            >
              <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
              <p className="text-gray-500 text-sm">Loading...</p>
            </motion.div>
          )}

          {/* No Squad */}
          {pvpState === "no_squad" && (
            <motion.div key="no-squad" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center min-h-[60vh] gap-4 text-center"
            >
              <Users className="w-16 h-16 text-gray-600" />
              <h2 className="text-xl font-bold text-white">Incomplete Squad</h2>
              <p className="text-gray-400 text-sm">You need a full 5-player squad to play online.</p>
              <div className="flex gap-3 mt-4">
                <button onClick={() => router.push("/game/squad")}
                  className="px-6 py-3 bg-[#e09225] text-[#0a1628] font-bold rounded-xl"
                >
                  Build Squad
                </button>
                <button onClick={() => router.push("/game/play")}
                  className="px-6 py-3 bg-white/5 text-gray-300 border border-white/10 rounded-xl"
                >
                  Back
                </button>
              </div>
            </motion.div>
          )}

          {/* Error */}
          {pvpState === "error" && (
            <motion.div key="error" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center min-h-[60vh] gap-4 text-center"
            >
              <AlertTriangle className="w-16 h-16 text-red-400" />
              <h2 className="text-xl font-bold text-white">Connection Error</h2>
              <p className="text-gray-400 text-sm max-w-md whitespace-pre-line">{errorMsg}</p>
              <div className="flex gap-3 mt-4">
                <button onClick={() => window.location.reload()}
                  className="px-6 py-3 bg-blue-500 text-white font-bold rounded-xl flex items-center gap-2"
                >
                  <RefreshCw className="w-4 h-4" /> Retry
                </button>
                <button onClick={() => router.push("/game/play")}
                  className="px-6 py-3 bg-white/5 text-gray-300 border border-white/10 rounded-xl flex items-center gap-2"
                >
                  <ArrowLeft className="w-4 h-4" /> Back
                </button>
              </div>
            </motion.div>
          )}

          {/* Connecting */}
          {pvpState === "connecting" && !connected && (
            <motion.div key="connecting" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center min-h-[60vh] gap-4"
            >
              <div className="w-16 h-16 border-4 border-blue-500/30 border-t-blue-400 rounded-full animate-spin" />
              <p className="text-gray-400">Connecting to game server...</p>
              <p className="text-gray-600 text-xs">Make sure `npm run socket` is running on port 3001</p>
              <button onClick={() => router.push("/game/play")}
                className="text-sm text-gray-500 hover:text-white mt-4"
              >
                Cancel
              </button>
            </motion.div>
          )}

          {/* Queue */}
          {pvpState === "queue" && (
            <motion.div key="queue" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center justify-center min-h-[60vh] gap-6"
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="w-24 h-24 rounded-full border-4 border-blue-500/30 border-t-blue-400 flex items-center justify-center"
              >
                <Search className="w-10 h-10 text-blue-400" />
              </motion.div>
              <div className="text-center">
                <h2 className="text-2xl font-bold text-white mb-2">Searching for Opponent</h2>
                <p className="text-gray-400">Looking for a similar-rated player...</p>
              </div>
              <div className="flex items-center gap-4 text-gray-500">
                <span className="flex items-center gap-2"><Clock className="w-4 h-4" /> {queueTime}s</span>
                {queuePosition > 0 && <span className="flex items-center gap-2"><Users className="w-4 h-4" /> Queue: {queuePosition}</span>}
              </div>
              <div className="bg-white/5 rounded-xl p-4 border border-white/10 text-center">
                <p className="text-sm text-gray-400">
                  Your Rating: <span className="text-white font-bold">{squadRating}</span>
                </p>
                <p className="text-xs text-gray-500 mt-1">Finding opponent ±15 rating range</p>
              </div>
              <button onClick={handleCancel} className="text-sm text-gray-500 hover:text-white transition">
                Cancel search
              </button>
            </motion.div>
          )}

          {/* Found / Countdown */}
          {(pvpState === "found" || pvpState === "countdown") && opponent && (
            <motion.div key="found" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center justify-center min-h-[60vh] gap-8"
            >
              <motion.div
                initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", delay: 0.2 }}
                className="w-24 h-24 mx-auto rounded-full bg-linear-to-br from-blue-500/20 to-blue-600/5 border-2 border-blue-400/30 flex items-center justify-center"
              >
                <Users className="w-12 h-12 text-blue-400" />
              </motion.div>
              <div className="text-center">
                <h2 className="text-2xl font-bold text-white mb-1">Opponent Found!</h2>
                <p className="text-gray-400">A worthy challenger awaits</p>
              </div>
              <div className="bg-white/5 rounded-xl p-6 border border-white/10 w-full">
                <div className="flex items-center justify-between">
                  <div className="text-center flex-1">
                    <div className="w-14 h-14 mx-auto mb-2 rounded-full bg-[#e09225]/10 border border-[#e09225]/30 flex items-center justify-center">
                      <User className="w-6 h-6 text-[#e09225]" />
                    </div>
                    <p className="text-lg font-bold text-white">{gameUser?.username}</p>
                    <p className="text-2xl font-bold text-[#e09225]">{squadRating}</p>
                    <p className="text-xs text-gray-500">Your Rating</p>
                  </div>
                  <div className="text-center px-6">
                    <motion.div key={countdownNum} initial={{ scale: 1.5 }} animate={{ scale: 1 }}
                      className="text-6xl font-bold text-[#e09225]"
                    >
                      {pvpState === "countdown" ? (countdownNum > 0 ? countdownNum : "GO!") : "vs"}
                    </motion.div>
                  </div>
                  <div className="text-center flex-1">
                    <div className="w-14 h-14 mx-auto mb-2 rounded-full bg-blue-500/10 border border-blue-500/30 flex items-center justify-center">
                      <User className="w-6 h-6 text-blue-400" />
                    </div>
                    <p className="text-lg font-bold text-white">{opponent.username}</p>
                    <p className="text-2xl font-bold text-blue-400">{opponent.squadRating}</p>
                    <p className="text-xs text-gray-500">Opponent Rating</p>
                  </div>
                </div>
                <div className="mt-4 flex items-center justify-center gap-2 text-gray-400 text-sm">
                  <Wifi className="w-4 h-4" />
                  <span>Live PvP • Real-time simulation</span>
                </div>
              </div>
            </motion.div>
          )}

          {/* Playing */}
          {pvpState === "playing" && (
            <motion.div key="playing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
              <div className="bg-linear-to-br from-blue-500/10 to-blue-600/5 rounded-2xl p-6 border border-blue-500/20">
                <div className="flex items-center justify-between">
                  <div className="text-center flex-1">
                    <p className="text-xs text-gray-400 mb-1">
                      {playerSide === "home" ? gameUser?.username || "You" : opponent?.username || "Opponent"}
                    </p>
                    <motion.p key={myScore} initial={{ scale: 1.3 }} animate={{ scale: 1 }}
                      className="text-5xl font-bold text-white"
                    >{myScore}</motion.p>
                    <p className="text-[10px] text-gray-500 mt-1">{playerSide === "home" ? "(Home)" : "(Away)"}</p>
                  </div>
                  <div className="px-4">
                    <div className="flex items-center gap-2">
                      <Wifi className="w-4 h-4 text-blue-400 animate-pulse" />
                      <span className="text-xs text-blue-400 font-bold">LIVE</span>
                    </div>
                  </div>
                  <div className="text-center flex-1">
                    <p className="text-xs text-gray-400 mb-1">
                      {playerSide === "away" ? gameUser?.username || "You" : opponent?.username || "Opponent"}
                    </p>
                    <motion.p key={opScore} initial={{ scale: 1.3 }} animate={{ scale: 1 }}
                      className="text-5xl font-bold text-white"
                    >{opScore}</motion.p>
                    <p className="text-[10px] text-gray-500 mt-1">{playerSide === "away" ? "(Home)" : "(Away)"}</p>
                  </div>
                </div>
              </div>
              <div className="space-y-2 max-h-[50vh] overflow-y-auto">
                {events.map((event, i) => (
                  <motion.div key={i} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
                    className={`flex items-start gap-3 p-3 rounded-xl ${event.type === "goal" ? "bg-white/5 border border-white/10" : ""}`}
                  >
                    <span className="text-xs font-bold text-gray-500 w-12 shrink-0">{event.minute}'</span>
                    <span className="shrink-0">{getEventIcon(event.type)}</span>
                    <p className="text-sm text-gray-300">{event.description}</p>
                  </motion.div>
                ))}
                <div ref={eventsEndRef} />
              </div>
              <div className="flex items-center justify-center gap-2 py-3 text-gray-500">
                <div className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
                <span className="text-xs">Match in progress...</span>
              </div>
            </motion.div>
          )}

          {/* Result */}
          {pvpState === "result" && matchResult && (
            <motion.div key="result" initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              <div className="text-center">
                <div className="text-6xl mb-4">{getResultEmoji(matchResult.winner)}</div>
                <h1 className={`text-4xl font-bold uppercase ${
                  matchResult.winner === "draw" ? "text-amber-400" :
                  (playerSide === "home" && matchResult.winner === "home") || (playerSide === "away" && matchResult.winner === "away")
                    ? "text-green-400" : "text-red-400"
                }`}>
                  {getResultText(matchResult.winner)}
                </h1>
                <p className="text-gray-400 mt-2">PvP Match Complete</p>
              </div>
              <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
                <div className="flex items-center justify-between">
                  <div className="text-center flex-1">
                    <p className="text-xs text-gray-400 mb-1">{gameUser?.username || "You"}</p>
                    <p className="text-5xl font-bold text-white">{myScore}</p>
                  </div>
                  <div className="text-center px-4"><p className="text-sm font-bold text-gray-500">FINAL</p></div>
                  <div className="text-center flex-1">
                    <p className="text-xs text-gray-400 mb-1">{opponent?.username || "Opponent"}</p>
                    <p className="text-5xl font-bold text-white">{opScore}</p>
                  </div>
                </div>
              </div>
              <div className="bg-white/5 rounded-xl p-4 border border-white/10 space-y-3">
                <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wider">Match Stats</h3>
                <StatRow label="Possession" showPercent left={playerSide === "home" ? matchResult.homePossession : matchResult.awayPossession}
                  right={playerSide === "home" ? matchResult.awayPossession : matchResult.homePossession} />
                <StatRow label="Shots" left={playerSide === "home" ? matchResult.homeShots : matchResult.awayShots}
                  right={playerSide === "home" ? matchResult.awayShots : matchResult.homeShots} />
                <StatRow label="Shots on Target" left={playerSide === "home" ? matchResult.homeShotsOnTarget : matchResult.awayShotsOnTarget}
                  right={playerSide === "home" ? matchResult.awayShotsOnTarget : matchResult.homeShotsOnTarget} />
              </div>

              <div className="bg-linear-to-r from-[#e09225]/20 to-[#e09225]/5 rounded-xl p-6 border border-[#e09225]/20">
                <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-4">Your Rewards</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <p className="text-3xl font-bold text-white">
                      +{savingRewards ? <Loader className="w-5 h-5 animate-spin inline" /> :
                        (playerSide === "home" ? matchResult.homeRewards.xp : matchResult.awayRewards.xp)}
                    </p>
                    <p className="text-xs text-gray-500">XP Earned</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold text-white">
                      +{savingRewards ? <Loader className="w-5 h-5 animate-spin inline" /> :
                        (playerSide === "home" ? matchResult.homeRewards.coins : matchResult.awayRewards.coins)}
                    </p>
                    <p className="text-xs text-gray-500">Coins Earned</p>
                  </div>
                </div>
              </div>
              <div className="text-center">
                <p className="text-gray-500 text-sm">Rewards saved! Returning to home...</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
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
