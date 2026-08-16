"use client";

import { useQuery, useMutation, useQueryClient, useInfiniteQuery, keepPreviousData } from "@tanstack/react-query";

import api from "@/lib/api/axios";

async function fetchJSON(url: string) {
  try {
    // Strip /api prefix if present since the axios instance already has baseURL="/api"
    const path = url.startsWith("/api/") ? url.slice(4) : url;
    const { data } = await api.get(path);
    return data;
  } catch (err: any) {
    const message = err?.response?.data?.message || err?.message || `Request failed`;
    throw new Error(message);
  }
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

export function useInfiniteShop(limit: number = 12) {
  return useInfiniteQuery({
    queryKey: ["game", "shop", "infinite", limit],
    queryFn: ({ pageParam }) =>
      fetchJSON(`/api/game/shop?page=${pageParam}&limit=${limit}`),
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.pagination.hasMore ? lastPage.pagination.page + 1 : undefined,
    staleTime: 15_000,
    retry: 1,
  });
}

export function useBuyPlayer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (playerId: string) => {
      const { data } = await api.post("/game/shop", { playerId });
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["game", "shop"] });
      qc.invalidateQueries({ queryKey: ["game", "shop", "infinite"] });
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

export function useInfiniteCollection(params?: {
  rarity?: string;
  position?: string;
  search?: string;
  owned?: string;
  limit?: number;
}) {
  const limit = params?.limit || 24;

  // Build a consistent query key that excludes page
  const qs = new URLSearchParams();
  if (params?.rarity && params.rarity !== "all") qs.set("rarity", params.rarity);
  if (params?.position && params.position !== "all") qs.set("position", params.position);
  if (params?.search) qs.set("search", params.search);
  if (params?.owned) qs.set("owned", params.owned);
  qs.set("limit", String(limit));
  const query = qs.toString();

  return useInfiniteQuery({
    queryKey: ["game", "collection", "infinite", query],
    queryFn: ({ pageParam }) =>
      fetchJSON(`/api/game/collection?${query}&page=${pageParam}`),
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.hasMore ? lastPage.page + 1 : undefined,
    staleTime: 20_000,
    retry: 1,
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
    mutationFn: async (payload: { players: any[]; formation?: string }) => {
      const { data } = await api.put("/game/squad", payload);
      return data;
    },
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
    mutationFn: async () => {
      const { data } = await api.post("/game/match/start");
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["game", "user"] });
    },
  });
}

export function useContinueMatch() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: {
      matchId: string;
      updatedSquad?: { players: { ownedPlayerId: string; position: string }[] };
    }) => {
      const { data } = await api.post("/game/match/continue", payload);
      return data;
    },
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
