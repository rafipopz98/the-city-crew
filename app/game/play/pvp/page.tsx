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
  Target,
  Award,
  Frown,
  Handshake,
  Coins,
  AlertTriangle,
} from "lucide-react";
import { useSocket } from "@/lib/game/socket/client";
import type { ServerMessage } from "@/lib/game/socket/protocol";
import { ErrorState, HalftimeModal, type HalftimeSquadChange } from "@/app/game/_components";
import { computeClientSquadRating } from "@/lib/game/utils/clientSquadRating";
import api from "@/lib/api/axios";

interface MatchSocketEvent {
  minute: number;
  type: string;
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

type PvPState = "loading" | "no_squad" | "no_coins" | "connecting" | "queue" | "found" | "countdown" | "playing" | "result" | "error";

export default function PvPPage() {
  const router = useRouter();
  const { connected, sendMessage, registerListeners, joinQueue, leaveQueue } = useSocket();
  const [pvpState, setPvpState] = useState<PvPState>("loading");
  const [showHalftime, setShowHalftime] = useState(false);
  const [gameUser, setGameUser] = useState<any>(null);
  const [squad, setSquad] = useState<any>(null);
  const [ownedPlayers, setOwnedPlayers] = useState<any[]>([]);
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
    console.log("[PvP] Loading user data and squad...");
    Promise.all([
      api.get("/game/user"),
      api.get("/game/squad"),
    ])
      .then(([userResp, squadResp]) => {
        const userData = userResp.data;
        const squadData = squadResp.data;
        console.log("[PvP] Data loaded:", { user: !!userData.gameUser, squad: !!squadData.squad });
        if (!userData.gameUser) {
          console.log("[PvP] No game user — redirecting to onboarding");
          router.push("/game/onboarding");
          return;
        }
        setGameUser(userData.gameUser);

        const sq = squadData.squad;
        if (!sq || !sq.players || sq.players.length !== 5) {
          console.log("[PvP] Incomplete squad — showing no_squad");
          setPvpState("no_squad");
          return;
        }

        // Check entry fee
        if ((userData.gameUser?.coins ?? 0) < 5) {
          console.log("[PvP] Not enough coins — showing no_coins");
          setPvpState("no_coins");
          return;
        }

        console.log("[PvP] Squad valid with", sq.players.length, "players");
        setSquad(sq);
        setOwnedPlayers(squadData.ownedPlayers || []);
        console.log("[PvP] Setting state to 'connecting'");
        setPvpState("connecting");
      })
      .catch((err) => {
        console.error("[PvP] Failed to load profile:", err);
        setPvpState("error");
        setErrorMsg("Failed to load profile");
      });
  }, [router]);

  // Auto-join queue when connected
  useEffect(() => {
    console.log("[PvP] Auto-join effect running:", { connected, hasGameUser: !!gameUser, hasSquad: !!squad, pvpState, hasJoined: hasJoinedRef.current });
    if (!connected || !gameUser || !squad) {
      console.log("[PvP] Auto-join: waiting for connection/data (connected:" + connected + " gameUser:" + !!gameUser + " squad:" + !!squad + ")");
      return;
    }
    if (pvpState === "queue" && hasJoinedRef.current) {
      console.log("[PvP] Auto-join: already joined queue, skipping");
      return;
    }
    if (pvpState !== "connecting" && pvpState !== "queue") {
      console.log("[PvP] Auto-join: wrong state (" + pvpState + "), skipping");
      return;
    }

    const rating = computeClientSquadRating(squad, ownedPlayers);

    const playerNames = squad.players.map((p: any) => p.playerId?.short_name || "Player");
    const playerPositions = squad.players.map((p: any) => p.position || "MID");

    console.log("[PvP] Joining queue...", { username: gameUser.username, rating, playerNames, playerPositions });
    hasJoinedRef.current = true;
    setPvpState("queue");
    setQueueTime(0);

    joinQueue({
      userId: gameUser.userId || gameUser._id,
      squadRating: rating,
      username: gameUser.username,
      squadPlayers: playerNames,
      squadPlayerPositions: playerPositions,
    }).catch((err) => {
      console.error("[PvP] Queue join failed:", err);
      hasJoinedRef.current = false;
      setPvpState("error");
      setErrorMsg("Could not connect to the game server. Make sure the socket server is running.");
    });
  }, [connected, gameUser, squad, ownedPlayers, pvpState, joinQueue]);

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

  // Reset join flag on disconnect so auto-join re-fires on reconnect
  useEffect(() => {
    if (!connected && (pvpState === "queue" || pvpState === "connecting")) {
      hasJoinedRef.current = false;
    }
  }, [connected, pvpState]);

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
    console.log("[PvP] Registering socket listeners...");
    const cleanup = registerListeners((message: ServerMessage) => {
      console.log("[PvP] Listener received:", message.type, message.payload);
      switch (message.type) {
        case "matchmaking:waiting":
          console.log("[PvP] Queue position:", message.payload.position);
          setQueuePosition(message.payload.position);
          break;

        case "matchmaking:found":
          console.log("[PvP] Match found!", message.payload);
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
          console.log("[PvP] ⚡ Match event:", event.minute + "' - " + event.description);
          setEvents((prev) => {
            const updated = [...prev, event];
            if (event.type === "goal") {
              const homeGoals = updated.filter(
                (e) => e.type === "goal" && e.actorName === "home",
              ).length;
              const awayGoals = updated.filter(
                (e) => e.type === "goal" && e.actorName === "away",
              ).length;
              // Let the goal event itself render first — the scoreboard
              // ticking up a beat later reads as "the goal caused the
              // score to change" instead of both happening at once.
              setTimeout(() => {
                console.log("[PvP] Score update:", homeGoals + "-" + awayGoals);
                setMatchScore({ home: homeGoals, away: awayGoals });
              }, 600);
            }
            return updated;
          });
          setPvpState("playing");
          break;
        }

        case "match:halftime":
          console.log("[PvP] Half time:", message.payload);
          setMatchScore({ home: message.payload.homeScore, away: message.payload.awayScore });
          setShowHalftime(true);
          break;

        case "match:end":
          console.log("[PvP] Match ended!", message.payload);
          setMatchResult(message.payload);
          setShowHalftime(false);
          setPvpState("result");
          savePvPRewards(message.payload);
          break;

        case "match:error":
          console.error("[PvP] Match error:", message.payload.message);
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

  // Claim PvP rewards from backend. Only matchId (+ events, for the
  // match-history display) are sent — score/possession/result/xp/coins are
  // no longer trusted from the client at all; the server looks up what it
  // actually computed and stored when the match ended, and pays out this
  // user's own side of it exactly once.
  const savePvPRewards = async (result: MatchSocketResult) => {
    setSavingRewards(true);
    try {
      await api.post("/game/match/pvp", {
        matchId: result.matchId,
        events: result.events,
      });
    } catch (err) {
      console.error("Failed to save PvP rewards:", err);
    } finally {
      setSavingRewards(false);
    }
  };

  // Halftime — send the (optional) substitution/formation change to the
  // server, which is what actually decides the second half. Fires either
  // when the player confirms, or the 30s countdown in HalftimeModal runs out.
  const handleHalftimeSubmit = (change?: HalftimeSquadChange) => {
    if (matchId) {
      sendMessage({ type: "match:subs", payload: { matchId, updatedSquad: change } });
    }
    setShowHalftime(false);
  };

  // Cancel queue — go home
  const handleCancel = () => {
    leaveQueue();
    hasJoinedRef.current = false;
    router.push("/game/home");
  };

  const squadRating = computeClientSquadRating(squad, ownedPlayers);

  const getEventIcon = (type: string) => {
    switch (type) {
      case "goal": return <Target className="w-5 h-5 text-green-400 shrink-0" />;
      case "save": return <Shield className="w-5 h-5 text-blue-400 shrink-0" />;
      case "chance": return <Zap className="w-5 h-5 text-amber-400 shrink-0" />;
      case "half_time": case "full_time": return <Clock className="w-5 h-5 text-gray-500 shrink-0" />;
      default: return <Zap className="w-5 h-5 text-gray-500 shrink-0" />;
    }
  };

  /** Small badge showing which team this event belongs to */
  const TeamBadge = ({ actorName }: { actorName: string }) => {
    if (!actorName) return null;
    const isMyTeam = actorName === playerSide;
    return (
      <span className={`shrink-0 text-[10px] font-bold px-1.5 py-0.5 rounded-md ${
        isMyTeam
          ? "bg-green-500/15 text-green-400 border border-green-500/25"
          : "bg-red-500/15 text-red-400 border border-red-500/25"
      }`}>
        {isMyTeam ? "YOU" : "OPP"}
      </span>
    );
  };

  const getResultIcon = (winner: string) => {
    if (winner === "draw") return <Handshake className="w-14 h-14 text-amber-400" />;
    const myResult = playerSide === "home"
      ? winner === "home" ? "win" : "loss"
      : winner === "away" ? "win" : "loss";
    return myResult === "win" ? <Award className="w-14 h-14 text-green-400" /> : <Frown className="w-14 h-14 text-red-400" />;
  };

  const getResultText = (winner: string) => {
    if (winner === "draw") return "Draw";
    const myResult = playerSide === "home"
      ? winner === "home" ? "win" : "loss"
      : winner === "away" ? "win" : "loss";
    return myResult === "win" ? "Victory!" : "Defeat";
  };

  return (
    <div className="h-full overflow-y-auto">
      {showHalftime && (
        <HalftimeModal
          userScore={playerSide === "home" ? matchScore.home : matchScore.away}
          opponentScore={playerSide === "home" ? matchScore.away : matchScore.home}
          onSubmit={handleHalftimeSubmit}
        />
      )}
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

          {/* No Coins */}
          {pvpState === "no_coins" && (
            <motion.div key="no-coins" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center min-h-[60vh] gap-6 text-center"
            >
              <div className="w-20 h-20 rounded-full bg-amber-500/10 border-2 border-amber-500/20 flex items-center justify-center">
                <Coins className="w-10 h-10 text-amber-400" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white mb-2">Not Enough Coins</h2>
                <p className="text-gray-400 text-sm max-w-xs mx-auto">
                  You need at least <strong className="text-amber-400">5 coins</strong> to play an online match. The entry fee is deducted when the match starts.
                </p>
              </div>

              <div className="bg-amber-500/5 border border-amber-500/15 rounded-xl p-4 w-full max-w-sm">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">Your balance</span>
                  <span className="text-red-400 font-bold">{gameUser?.coins || 0} coins</span>
                </div>
                <div className="flex items-center justify-between text-sm mt-2">
                  <span className="text-gray-400">Entry fee</span>
                  <span className="text-amber-400 font-bold">5 coins</span>
                </div>
                <div className="flex items-center gap-1.5 mt-3 text-xs text-gray-500">
                  <AlertTriangle className="w-3 h-3" />
                  <span>Win matches or buy from the shop to earn coins</span>
                </div>
              </div>

              <div className="flex gap-3 mt-2">
                <button onClick={() => router.push("/game/shop")}
                  className="px-6 py-3 bg-[#e09225] text-[#0a1628] font-bold rounded-xl"
                >
                  Go to Shop
                </button>
                <button onClick={() => router.push("/game/home")}
                  className="px-6 py-3 bg-white/5 text-gray-300 border border-white/10 rounded-xl"
                >
                  Home
                </button>
              </div>
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
                <button onClick={() => router.push("/game/home")}
                  className="px-6 py-3 bg-white/5 text-gray-300 border border-white/10 rounded-xl"
                >
                  Home
                </button>
              </div>
            </motion.div>
          )}

          {/* Error */}
          {pvpState === "error" && (
            <ErrorState
              title="Connection Error"
              message={errorMsg}
              onRetry={() => window.location.reload()}
            />
          )}

          {/* Connecting */}
          {pvpState === "connecting" && !connected && (
            <motion.div key="connecting" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center min-h-[60vh] gap-4"
            >
              <div className="w-16 h-16 border-4 border-blue-500/30 border-t-blue-400 rounded-full animate-spin" />
              <p className="text-gray-400">Connecting to game server...</p>
              <p className="text-gray-600 text-xs">Make sure `npm run socket` is running on port 3001</p>
              <button onClick={() => router.push("/game/home")}
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

              {/* Fee info */}
              <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-3 w-full max-w-sm space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5 text-gray-400">
                    <Coins className="w-3.5 h-3.5 text-amber-400" />
                    <span>Entry fee</span>
                  </div>
                  <span className="text-amber-400 font-bold">-5 coins</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-400">Your balance</span>
                  <span className="font-bold text-white">{gameUser?.coins || 0} coins</span>
                </div>
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
              {/* Disconnect warning */}
              <div className="flex items-center justify-center gap-1.5 text-[10px] text-amber-500/70 bg-amber-500/[0.04] border border-amber-500/10 rounded-lg px-3 py-1.5">
                <span className="text-amber-500/80">⚠</span>
                <span>Don&apos;t leave this screen — leaving forfeits the match and you lose your coins.</span>
              </div>
              <div className="bg-linear-to-br from-blue-500/10 to-blue-600/5 rounded-2xl p-6 border border-blue-500/20">
                <div className="flex items-center justify-between">
                  <div className="text-center flex-1">
                    <p className="text-xs text-gray-400 mb-1">
                      {playerSide === "home" ? gameUser?.username || "You" : opponent?.username || "Opponent"}
                    </p>
                    <motion.p key={matchScore.home} initial={{ scale: 1.3 }} animate={{ scale: 1 }}
                      className="text-5xl font-bold text-white"
                    >{matchScore.home}</motion.p>
                    <p className="text-[10px] text-gray-500 mt-1">(Home)</p>
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
                    <motion.p key={matchScore.away} initial={{ scale: 1.3 }} animate={{ scale: 1 }}
                      className="text-5xl font-bold text-white"
                    >{matchScore.away}</motion.p>
                    <p className="text-[10px] text-gray-500 mt-1">(Away)</p>
                  </div>
                </div>
              </div>
              <div className="space-y-2 max-h-[50vh] overflow-y-auto">
                {events.map((event, i) => (
                  <motion.div key={i} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
                    className={`flex items-start gap-3 p-3 rounded-xl ${
                      event.type === "goal"
                        ? event.actorName === playerSide
                          ? "bg-green-500/5 border border-green-500/15"
                          : "bg-red-500/5 border border-red-500/15"
                        : ""
                    }`}
                  >
                    <span className="text-xs font-bold text-gray-500 w-10 shrink-0">{event.minute}'</span>
                    <span className="shrink-0">{getEventIcon(event.type)}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-300 leading-snug">{event.description}</p>
                    </div>
                    <TeamBadge actorName={event.actorName} />
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
                <div className="mb-4 flex justify-center">{getResultIcon(matchResult.winner)}</div>
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
                    <p className="text-xs text-gray-400 mb-1">{playerSide === "home" ? gameUser?.username || "You" : opponent?.username || "Opponent"}</p>
                    <p className="text-5xl font-bold text-white">{matchScore.home}</p>
                  </div>
                  <div className="text-center px-4"><p className="text-sm font-bold text-gray-500">FINAL</p></div>
                  <div className="text-center flex-1">
                    <p className="text-xs text-gray-400 mb-1">{playerSide === "away" ? gameUser?.username || "You" : opponent?.username || "Opponent"}</p>
                    <p className="text-5xl font-bold text-white">{matchScore.away}</p>
                  </div>
                </div>
              </div>
              <div className="bg-white/5 rounded-xl p-4 border border-white/10 space-y-3">
                <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wider">Match Stats</h3>
                <StatRow label="Possession" showPercent left={matchResult.homePossession}
                  right={matchResult.awayPossession} />
                <StatRow label="Shots" left={matchResult.homeShots}
                  right={matchResult.awayShots} />
                <StatRow label="Shots on Target" left={matchResult.homeShotsOnTarget}
                  right={matchResult.awayShotsOnTarget} />
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
