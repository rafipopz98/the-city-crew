"use client";

import { useQuery, useMutation, useQueryClient, keepPreviousData } from "@tanstack/react-query";

async function fetchJSON(url: string) {
  const res = await fetch(url, { credentials: "include" });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.message || `Request failed: ${res.status}`);
  }
  return res.json();
}

// ─── Game User ──────────────────────────────────────────────────────────────
export function useGameUser() {
  return useQuery({
    queryKey: ["game", "user"],
    queryFn: () => fetchJSON("/api/game/user"),
    staleTime: 30_000, // 30s — game user data changes frequently (XP/coins)
    retry: 1,
  });
}

// ─── Shop ───────────────────────────────────────────────────────────────────
export function useShop() {
  return useQuery({
    queryKey: ["game", "shop"],
    queryFn: () => fetchJSON("/api/game/shop"),
    staleTime: 15_000,
    retry: 1,
  });
}

export function useBuyPlayer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (playerId: string) =>
      fetch("/api/game/shop", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ playerId }),
        credentials: "include",
      }).then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Purchase failed");
        return data;
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["game", "shop"] });
      qc.invalidateQueries({ queryKey: ["game", "collection"] });
      qc.invalidateQueries({ queryKey: ["game", "squad"] });
      qc.invalidateQueries({ queryKey: ["game", "user"] });
    },
  });
}

// ─── Collection ─────────────────────────────────────────────────────────────
export function useCollection(params?: { rarity?: string; position?: string; search?: string; owned?: string }) {
  const qs = new URLSearchParams();
  if (params?.rarity && params.rarity !== "all") qs.set("rarity", params.rarity);
  if (params?.position && params.position !== "all") qs.set("position", params.position);
  if (params?.search) qs.set("search", params.search);
  if (params?.owned) qs.set("owned", params.owned);
  const query = qs.toString();

  return useQuery<any>({
    queryKey: ["game", "collection", query],
    queryFn: () => fetchJSON(`/api/game/collection${query ? `?${query}` : ""}`),
    staleTime: 20_000,
    placeholderData: keepPreviousData,
  });
}

// ─── Squad ──────────────────────────────────────────────────────────────────
export function useSquad() {
  return useQuery({
    queryKey: ["game", "squad"],
    queryFn: () => fetchJSON("/api/game/squad"),
    staleTime: 10_000,
    retry: 1,
  });
}

export function useSaveSquad() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (players: any[]) =>
      fetch("/api/game/squad", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ players }),
        credentials: "include",
      }).then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Failed to save squad");
        return data;
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["game", "squad"] });
      qc.invalidateQueries({ queryKey: ["game", "user"] });
    },
  });
}

// ─── Match ──────────────────────────────────────────────────────────────────
export function useStartMatch() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () =>
      fetch("/api/game/match/start", {
        method: "POST",
        credentials: "include",
      }).then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Match start failed");
        return data;
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["game", "user"] });
    },
  });
}

export function useMatchResult(matchId?: string) {
  return useQuery({
    queryKey: ["game", "match", matchId],
    queryFn: () => fetchJSON(`/api/game/match/${matchId}`),
    enabled: !!matchId,
    staleTime: Infinity, // Match results are immutable
  });
}

// ─── Match History ──────────────────────────────────────────────────────────
export function useMatchHistory(page: number = 1, limit: number = 20) {
  return useQuery<any>({
    queryKey: ["game", "match", "history", page, limit],
    queryFn: () => fetchJSON(`/api/game/match/history?page=${page}&limit=${limit}`),
    staleTime: 10_000,
    placeholderData: keepPreviousData,
    retry: 1,
  });
}

// ─── Leaderboard ────────────────────────────────────────────────────────────
export function useLeaderboard(sort: string = "xp", limit: number = 50) {
  return useQuery<any>({
    queryKey: ["game", "leaderboard", sort],
    queryFn: () => fetchJSON(`/api/game/leaderboard?sort=${sort}&limit=${limit}`),
    staleTime: 15_000,
    retry: 1,
  });
}
