"use client";

import { useState, useEffect } from "react";
import { Search, Plus, Pencil, Trash2 } from "lucide-react";
import GamePlayerModal from "@/components/Admin/GamePlayers/GamePlayerModal";

const RARITIES = ["", "Basic", "Common", "Uncommon", "Rare", "Epic", "Legendary"];
const DEFAULT_POSITIONS = ["GK", "CB", "LB", "RB", "CDM", "CM", "CAM", "LM", "RM", "LW", "RW", "ST", "CF"];

export default function AdminGamePlayersPage() {
  const [players, setPlayers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [rarityFilter, setRarityFilter] = useState("");
  const [positionFilter, setPositionFilter] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalPlayers, setTotalPlayers] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingPlayer, setEditingPlayer] = useState<any>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const LIMIT = 20;

  useEffect(() => {
    fetchPlayers();
  }, [search, rarityFilter, positionFilter, page, refreshTrigger]);

  const fetchPlayers = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (search) params.append("search", search);
      if (rarityFilter) params.append("rarity", rarityFilter);
      if (positionFilter) params.append("position", positionFilter);
      params.append("page", page.toString());
      params.append("limit", LIMIT.toString());

      const res = await fetch(`/api/admin/game-players?${params}`);
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setPlayers(data.players);
      setTotalPages(data.totalPages);
      setTotalPlayers(data.totalPlayers);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this game player?")) return;
    try {
      const res = await fetch(`/api/admin/game-players/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
      setRefreshTrigger((t) => t + 1);
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleEdit = (player: any) => {
    setEditingPlayer(player);
    setModalOpen(true);
  };

  const handleAdd = () => {
    setEditingPlayer(null);
    setModalOpen(true);
  };

  const handleSave = () => {
    setRefreshTrigger((t) => t + 1);
    setModalOpen(false);
    setEditingPlayer(null);
  };

  const getRarityBadge = (rarity: string) => {
    const colors: Record<string, string> = {
      Basic: "bg-gray-200 text-gray-700",
      Common: "bg-gray-300 text-gray-800",
      Uncommon: "bg-green-200 text-green-800",
      Rare: "bg-blue-200 text-blue-800",
      Epic: "bg-purple-200 text-purple-800",
      Legendary: "bg-amber-200 text-amber-900",
    };
    return colors[rarity] || "bg-gray-100 text-gray-600";
  };

  return (
    <div className="min-h-screen bg-[#ece1cf]">
      <GamePlayerModal
        open={modalOpen}
        onClose={() => { setModalOpen(false); setEditingPlayer(null); }}
        onSave={handleSave}
        player={editingPlayer}
      />

      <div className="w-full px-5">
        {/* Header */}
        <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <p className="mb-2 md:mb-3 text-[10px] md:text-xs uppercase tracking-[0.35em] text-black/40">
              Game Management
            </p>
            <h1 className="para text-[2rem] leading-[0.9] uppercase text-black md:text-[3.5rem] lg:text-[5rem]">
              Game Players
            </h1>
            <p className="mt-3 md:mt-5 max-w-2xl text-[13px] md:text-[15px] leading-6 md:leading-8 text-black/60">
              Manage FIFA-style player cards used in the TCC Manager game. Edit stats, rarity, prices, and player attributes.
            </p>
          </div>
          <button
            onClick={handleAdd}
            className="group flex items-center gap-4 self-start lg:self-end border-b-2 border-black pb-2 para uppercase text-lg transition-all hover:border-[#e09225] hover:text-[#e09225]"
          >
            <span>Add Player</span>
            <div className="overflow-hidden">
              <Plus size={20} className="transition duration-300 group-hover:translate-x-1 group-hover:-translate-y-1" />
            </div>
          </button>
        </div>

        {/* Filters */}
        <div className="mt-8 md:mt-12 space-y-6 md:space-y-8">
          {/* Search */}
          <div>
            <p className="mb-3 text-xs uppercase tracking-[0.35em] text-black/45">Search</p>
            <div className="relative">
              <Search size={18} className="absolute left-0 top-1/2 -translate-y-1/2 text-black/40 md:w-[22px] md:h-[22px]" />
              <input
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                placeholder="Search by name, nationality..."
                className="h-12 md:h-16 w-full border-b-2 border-black/15 bg-transparent pl-9 md:pl-10 text-xl md:text-3xl para outline-none placeholder:text-black/25 transition-all focus:border-[#e09225]"
              />
            </div>
          </div>

          {/* Filter buttons */}
          <div className="flex flex-col gap-4 md:gap-6">
            <div>
              <p className="mb-3 md:mb-4 text-[10px] md:text-xs uppercase tracking-[0.35em] text-black/45">Rarity</p>
              <div className="flex flex-wrap gap-1.5 md:gap-2">
                {RARITIES.map((r) => (
                  <button
                    key={r || "all"}
                    onClick={() => { setRarityFilter(r); setPage(1); }}
                    className={`border px-3 md:px-4 py-1.5 md:py-2 para text-[10px] md:text-sm uppercase transition-all duration-300 ${
                      rarityFilter === r
                        ? "border-[#e09225] bg-[#e09225] text-black"
                        : "border-black/15 hover:border-black hover:bg-black hover:text-white"
                    }`}
                  >
                    {r || "All"}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="mb-3 md:mb-4 text-[10px] md:text-xs uppercase tracking-[0.35em] text-black/45">Position</p>
              <div className="flex flex-wrap gap-1.5 md:gap-2">
                <button
                  onClick={() => { setPositionFilter(""); setPage(1); }}
                  className={`border px-3 md:px-4 py-1.5 md:py-2 para text-[10px] md:text-sm uppercase transition-all duration-300 ${
                    !positionFilter
                      ? "border-[#e09225] bg-[#e09225] text-black"
                      : "border-black/15 hover:border-black hover:bg-black hover:text-white"
                  }`}
                >
                  All
                </button>
                {DEFAULT_POSITIONS.map((pos) => (
                  <button
                    key={pos}
                    onClick={() => { setPositionFilter(pos); setPage(1); }}
                    className={`border px-3 md:px-4 py-1.5 md:py-2 para text-[10px] md:text-sm uppercase transition-all duration-300 ${
                      positionFilter === pos
                        ? "border-[#e09225] bg-[#e09225] text-black"
                        : "border-black/15 hover:border-black hover:bg-black hover:text-white"
                    }`}
                  >
                    {pos}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Players list */}
        <div className="mt-10 md:mt-16">
          {loading ? (
            <div className="py-24 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#e09225] mx-auto" />
              <p className="mt-4 text-black/60">Loading players...</p>
            </div>
          ) : error ? (
            <div className="py-24 text-center">
              <h3 className="para text-4xl uppercase text-red-600">Error</h3>
              <p className="mt-4 text-black/60">{error}</p>
              <button onClick={fetchPlayers} className="mt-6 border border-black px-6 py-3 uppercase hover:bg-black hover:text-white transition">
                Try Again
              </button>
            </div>
          ) : players.length === 0 ? (
            <div className="py-24 text-center">
              <h3 className="para text-4xl uppercase">No Players Found</h3>
              <p className="mt-4 text-black/60">Try changing your search or filters.</p>
            </div>
          ) : (
            <>
              {/* Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-black/10 text-left text-[11px] uppercase tracking-wider text-black/40">
                      <th className="pb-4 pr-4 font-normal">Player</th>
                      <th className="pb-4 pr-4 font-normal">OVR</th>
                      <th className="pb-4 pr-4 font-normal">Positions</th>
                      <th className="pb-4 pr-4 font-normal">Rarity</th>
                      <th className="pb-4 pr-4 font-normal">Price</th>
                      <th className="pb-4 pr-4 font-normal">Stats</th>
                      <th className="pb-4 pr-4 font-normal text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {players.map((p) => (
                      <tr key={p._id} className="border-b border-black/5 hover:bg-black/[0.02] transition-colors">
                        <td className="py-4 pr-4">
                          <div className="flex items-center gap-3">
                            {p.image_url && (
                              <img src={p.image_url} alt="" className="w-10 h-10 rounded-full object-cover border border-black/10" />
                            )}
                            <div>
                              <p className="font-medium text-black">{p.short_name}</p>
                              <p className="text-[11px] text-black/40">{p.long_name}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 pr-4">
                          <span className="text-lg font-bold text-black">{p.overall}</span>
                        </td>
                        <td className="py-4 pr-4">
                          <div className="flex flex-wrap gap-1">
                            {(p.positions || []).map((pos: string) => (
                              <span key={pos} className="text-[10px] px-1.5 py-0.5 bg-black/5 rounded font-mono">{pos}</span>
                            ))}
                          </div>
                        </td>
                        <td className="py-4 pr-4">
                          <span className={`text-[11px] px-2 py-0.5 rounded font-semibold ${getRarityBadge(p.rarity)}`}>
                            {p.rarity}
                          </span>
                        </td>
                        <td className="py-4 pr-4">
                          <span className="font-mono text-sm text-black/70">{p.price} coins</span>
                        </td>
                        <td className="py-4 pr-4">
                          <div className="hidden lg:flex gap-2 text-[10px] font-mono text-black/50">
                            <span>PAC {p.pace}</span>
                            <span>SHO {p.shooting}</span>
                            <span>PAS {p.passing}</span>
                            <span>DRI {p.dribbling}</span>
                            <span>DEF {p.defending}</span>
                            <span>PHY {p.physic}</span>
                          </div>
                          <div className="lg:hidden text-[10px] font-mono text-black/50">
                            <span>PAC {p.pace}</span>
                          </div>
                        </td>
                        <td className="py-4 pr-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleEdit(p)}
                              className="p-2 rounded-lg hover:bg-black/5 transition"
                              title="Edit"
                            >
                              <Pencil size={16} className="text-black/40 hover:text-[#e09225]" />
                            </button>
                            <button
                              onClick={() => handleDelete(p._id)}
                              className="p-2 rounded-lg hover:bg-red-50 transition"
                              title="Delete"
                            >
                              <Trash2 size={16} className="text-black/40 hover:text-red-500" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
                  {/* Previous/Next row */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page === 1}
                      className="px-4 py-2 border border-black/20 uppercase text-xs disabled:opacity-30 disabled:cursor-not-allowed hover:border-black hover:bg-black hover:text-white transition"
                    >
                      ← Prev
                    </button>
                    <span className="sm:hidden text-xs text-black/40 px-2">
                      {page} / {totalPages}
                    </span>
                    <button
                      onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                      disabled={page === totalPages}
                      className="px-4 py-2 border border-black/20 uppercase text-xs disabled:opacity-30 disabled:cursor-not-allowed hover:border-black hover:bg-black hover:text-white transition"
                    >
                      Next →
                    </button>
                  </div>
                  {/* Desktop page numbers */}
                  <div className="hidden sm:flex items-center gap-1.5">
                    {(() => {
                      const pages: (number | string)[] = [];
                      const range = 2;
                      for (let i = 1; i <= totalPages; i++) {
                        if (
                          i === 1 ||
                          i === totalPages ||
                          (i >= page - range && i <= page + range)
                        ) {
                          pages.push(i);
                        } else if (pages[pages.length - 1] !== "...") {
                          pages.push("...");
                        }
                      }
                      return pages.map((p, i) =>
                        p === "..." ? (
                          <span key={`ellipsis-${i}`} className="px-1 text-xs text-black/30">…</span>
                        ) : (
                          <button
                            key={p}
                            onClick={() => setPage(p as number)}
                            className={`w-9 h-9 flex items-center justify-center border text-xs transition-all duration-300 ${
                              page === p
                                ? "border-[#e09225] bg-[#e09225] text-black font-bold"
                                : "border-black/20 hover:border-black hover:bg-black hover:text-white"
                            }`}
                          >
                            {p}
                          </button>
                        ),
                      );
                    })()}
                    <p className="ml-3 text-xs text-black/40">
                      {totalPlayers} total
                    </p>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
