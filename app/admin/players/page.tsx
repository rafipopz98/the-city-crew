"use client";

import { useState, useEffect } from "react";

import PlayerModal from "@/components/Admin/Players/PlayerModal";
import PlayersHeader from "@/components/Admin/Players/PlayersHeader";
import PlayersTable from "@/components/Admin/Players/PlayersTable";
import PlayersToolbar from "@/components/Admin/Players/PlayersToolbar";

const AdminPlayersPage = () => {
  const [search, setSearch] = useState("");
  const [season, setSeason] = useState(""); // Now this will be season ID
  const [position, setPosition] = useState("");

  const [openPlayerModal, setOpenPlayerModal] = useState(false);
  const [editingPlayer, setEditingPlayer] = useState<any>(null);
  const [seasons, setSeasons] = useState([]);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Fetch seasons for the modal
  useEffect(() => {
    fetchSeasons();
  }, []);

  const fetchSeasons = async () => {
    try {
      const response = await fetch("/api/admin/seasons");
      if (response.ok) {
        const data = await response.json();
        setSeasons(data);
      }
    } catch (error) {
      console.error("Error fetching seasons:", error);
    }
  };

  const handleAddPlayer = () => {
    setEditingPlayer(null);
    setOpenPlayerModal(true);
  };

  const handleEditPlayer = (player: any) => {
    setEditingPlayer(player);
    setOpenPlayerModal(true);
  };

  const handleSavePlayer = () => {
    // Trigger a refresh of the players table
    setRefreshTrigger((prev) => prev + 1);
  };

  return (
    <>
      <PlayerModal
        open={openPlayerModal}
        onClose={() => {
          setOpenPlayerModal(false);
          setEditingPlayer(null);
        }}
        onSave={handleSavePlayer}
        player={editingPlayer}
        seasons={seasons}
      />

      <main className="min-h-screen bg-[#ece1cf]">
        <div className="w-full px-5">
          <PlayersHeader onAddPlayer={handleAddPlayer} />

          <div className="mt-12">
            <PlayersToolbar
              search={search}
              onSearchChange={setSearch}
              season={season}
              onSeasonChange={setSeason}
              position={position}
              onPositionChange={setPosition}
            />
          </div>

          <div className="mt-10">
            <PlayersTable
              search={search}
              season={season}
              position={position}
              onEdit={handleEditPlayer}
              refreshTrigger={refreshTrigger}
            />
          </div>
        </div>
      </main>
    </>
  );
};

export default AdminPlayersPage;
