"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { motion } from "framer-motion";
import { Clock, Repeat, Check, Users, X } from "lucide-react";
import { useSquad } from "@/lib/game/hooks/useGameQuery";
import { playerMatchesCategory, getPrimaryCategory } from "@/lib/game/utils/positionMapping";
import { SQUAD_FORMATIONS, DEFAULT_FORMATION, type GamePosition } from "@/lib/game/utils/positions";

const COUNTDOWN_SECONDS = 30;

type Slot = { ownedPlayerId: string; playerId: string; position: GamePosition; player: any } | null;

export interface HalftimeSquadChange {
  players: { ownedPlayerId: string; position: GamePosition }[];
}

export function HalftimeModal({
  userScore,
  opponentScore,
  onSubmit,
}: {
  userScore: number;
  opponentScore: number;
  onSubmit: (change?: HalftimeSquadChange) => void;
}) {
  const { data } = useSquad();
  const ownedPlayers = data?.ownedPlayers || [];
  const existingSquad = data?.squad;

  const [formation, setFormation] = useState(DEFAULT_FORMATION);
  const [slots, setSlots] = useState<Slot[] | null>(null);
  const [activeSlot, setActiveSlot] = useState<number | null>(null);
  const [seconds, setSeconds] = useState(COUNTDOWN_SECONDS);
  const [submitted, setSubmitted] = useState(false);
  const [changed, setChanged] = useState(false);

  // Initialize from the saved active squad, once loaded.
  useEffect(() => {
    if (slots || !existingSquad?.players?.length) return;
    const f = SQUAD_FORMATIONS.find((x) => x.name === existingSquad.formation) || DEFAULT_FORMATION;
    setFormation(f);
    setSlots(
      existingSquad.players.map((p: any) => ({
        ownedPlayerId: p.ownedPlayerId?._id || p.ownedPlayerId,
        playerId: p.playerId?._id,
        position: p.position,
        player: p.playerId,
      })),
    );
  }, [existingSquad, slots]);

  const doSubmit = useCallback(() => {
    if (submitted) return;
    setSubmitted(true);
    if (!changed || !slots || slots.some((s) => !s)) {
      onSubmit(undefined);
    } else {
      onSubmit({
        players: (slots as NonNullable<Slot>[]).map((s) => ({
          ownedPlayerId: s.ownedPlayerId,
          position: s.position,
        })),
      });
    }
  }, [submitted, changed, slots, onSubmit]);

  // 30s countdown — auto-submits (with whatever's currently set, or no
  // change at all if nothing was touched) the instant it hits zero.
  useEffect(() => {
    if (submitted) return;
    if (seconds <= 0) {
      doSubmit();
      return;
    }
    const t = setTimeout(() => setSeconds((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [seconds, submitted, doSubmit]);

  const assignedPlayerIds = useMemo(
    () => new Set((slots || []).filter(Boolean).map((s) => s!.playerId)),
    [slots],
  );

  const availableBench = useMemo(
    () =>
      ownedPlayers.filter(
        (op: any) => op.playerId && !assignedPlayerIds.has(op.playerId._id),
      ),
    [ownedPlayers, assignedPlayerIds],
  );

  const handleFormationChange = (f: typeof DEFAULT_FORMATION) => {
    if (!slots) return;
    setFormation(f);
    setChanged(true);

    const current = slots.filter(Boolean) as NonNullable<Slot>[];
    const used = new Set<string>();
    const next: Slot[] = f.slots.map((pos) => {
      const match = current.find(
        (s) => !used.has(s.playerId) && playerMatchesCategory(s.player?.positions, pos),
      );
      if (match) {
        used.add(match.playerId);
        return { ...match, position: pos };
      }
      return null;
    });

    // Auto-fill any slot that lost its player (formation shrank a category)
    // with the best matching bench player, so the squad never ends up
    // incomplete after a formation change.
    const bench = ownedPlayers
      .filter((op: any) => op.playerId && !used.has(op.playerId._id))
      .sort((a: any, b: any) => (b.playerId?.overall || 0) - (a.playerId?.overall || 0));

    next.forEach((slot, i) => {
      if (slot) return;
      const pos = f.slots[i];
      const idx = bench.findIndex((op: any) => playerMatchesCategory(op.playerId.positions, pos));
      const pick = idx >= 0 ? bench[idx] : bench[0];
      if (pick) {
        used.add(pick.playerId._id);
        next[i] = {
          ownedPlayerId: pick._id,
          playerId: pick.playerId._id,
          position: pos,
          player: pick.playerId,
        };
        const removeIdx = bench.findIndex((b: any) => b._id === pick._id);
        if (removeIdx >= 0) bench.splice(removeIdx, 1);
      }
    });

    setSlots(next);
  };

  const handleAssign = (op: any) => {
    if (activeSlot === null || !slots) return;
    const next = [...slots];
    next[activeSlot] = {
      ownedPlayerId: op._id,
      playerId: op.playerId._id,
      position: formation.slots[activeSlot],
      player: op.playerId,
    };
    setSlots(next);
    setChanged(true);
    setActiveSlot(null);
  };

  const isLoading = !slots;

  return (
    <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-lg bg-[#0a1628] border border-white/10 rounded-2xl overflow-hidden shadow-2xl max-h-[90vh] flex flex-col"
      >
        {/* Header */}
        <div className="shrink-0 p-5 border-b border-white/5 text-center">
          <div className="flex items-center justify-center gap-2 text-gray-400 text-xs uppercase tracking-widest mb-2">
            <Clock className="w-3.5 h-3.5" />
            Half Time
          </div>
          <p className="text-3xl font-bold text-white mb-3">{userScore} - {opponentScore}</p>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#e09225]/10 border border-[#e09225]/20">
            <span className="text-[#e09225] font-bold text-sm tabular-nums">{seconds}s</span>
            <span className="text-gray-400 text-xs">to make changes</span>
          </div>
        </div>

        {isLoading ? (
          <div className="p-8 text-center text-gray-500 text-sm">Loading squad...</div>
        ) : (
          <>
            {/* Formation picker */}
            <div className="shrink-0 px-4 pt-4 flex items-center gap-1.5 overflow-x-auto">
              {SQUAD_FORMATIONS.map((f) => (
                <button
                  key={f.name}
                  onClick={() => f.name !== formation.name && handleFormationChange(f)}
                  className={`shrink-0 px-2.5 py-1 rounded-lg border text-[10px] font-bold transition-all ${
                    f.name === formation.name
                      ? "border-[#e09225] bg-[#e09225]/10 text-[#e09225]"
                      : "border-white/10 text-white/50 hover:border-white/20"
                  }`}
                >
                  {f.name}
                </button>
              ))}
            </div>

            {/* Slots */}
            <div className="flex-1 overflow-y-auto p-4 space-y-1.5">
              {(slots as Slot[]).map((slot, i) => (
                <button
                  key={i}
                  onClick={() => setActiveSlot(activeSlot === i ? null : i)}
                  className={`w-full flex items-center gap-3 p-2.5 rounded-xl border text-left transition-all ${
                    activeSlot === i
                      ? "border-[#e09225] bg-[#e09225]/10"
                      : "border-white/10 bg-white/[0.02] hover:border-white/20"
                  }`}
                >
                  <span className="shrink-0 w-9 h-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center overflow-hidden">
                    {slot?.player?.image_url ? (
                      <img src={slot.player.image_url} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <Users className="w-4 h-4 text-white/20" />
                    )}
                  </span>
                  <span className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-white truncate">
                      {slot?.player?.short_name || "Empty"}
                    </p>
                    <p className="text-[10px] text-gray-500">{formation.slots[i]}</p>
                  </span>
                  <Repeat className="w-3.5 h-3.5 text-white/30 shrink-0" />
                </button>
              ))}

              {activeSlot !== null && (
                <div className="mt-3 p-3 bg-white/[0.03] border border-white/10 rounded-xl">
                  <p className="text-[10px] uppercase tracking-widest text-gray-500 mb-2">
                    Bench — pick a {formation.slots[activeSlot]}
                  </p>
                  <div className="grid grid-cols-3 gap-1.5 max-h-40 overflow-y-auto">
                    {availableBench.length === 0 && (
                      <p className="col-span-3 text-xs text-gray-600 italic py-2 text-center">No bench players available</p>
                    )}
                    {availableBench.map((op: any) => (
                      <button
                        key={op._id}
                        onClick={() => handleAssign(op)}
                        className="flex flex-col items-center gap-1 p-2 rounded-lg hover:bg-white/5 transition"
                      >
                        <span className="w-8 h-8 rounded-full bg-white/5 border border-white/10 overflow-hidden flex items-center justify-center">
                          {op.playerId.image_url ? (
                            <img src={op.playerId.image_url} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <Users className="w-3.5 h-3.5 text-white/20" />
                          )}
                        </span>
                        <span className="text-[9px] text-white/70 truncate max-w-full">{op.playerId.short_name}</span>
                        <span className="text-[8px] text-white/30">{getPrimaryCategory(op.playerId.positions)}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </>
        )}

        {/* Footer */}
        <div className="shrink-0 p-4 border-t border-white/5">
          <button
            onClick={doSubmit}
            disabled={submitted}
            className="w-full py-3.5 bg-green-500 text-white font-bold rounded-xl hover:bg-green-500/90 transition disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <Check className="w-4 h-4" />
            {changed ? "Confirm Changes & Continue" : "Continue Without Changes"}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
