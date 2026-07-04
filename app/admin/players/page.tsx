"use client";

import { useState } from "react";

import PlayerModal from "@/components/Admin/Players/PlayerModal";
import PlayersHeader from "@/components/Admin/Players/PlayersHeader";
import PlayersTable from "@/components/Admin/Players/PlayersTable";
import PlayersToolbar from "@/components/Admin/Players/PlayersToolbar";

const AdminPlayersPage = () => {
  const [search, setSearch] = useState("");
  const [season, setSeason] = useState("");
  const [position, setPosition] = useState("");

  const [openPlayerModal, setOpenPlayerModal] = useState(false);

  return (
    <>
      <PlayerModal
        open={openPlayerModal}
        onClose={() => setOpenPlayerModal(false)}
      />

      <main className="min-h-screen bg-[#ece1cf]">
        <div className="w-full px-5">
          <PlayersHeader onAddPlayer={() => setOpenPlayerModal(true)} />

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
              onEdit={() => setOpenPlayerModal(true)}
            />
          </div>
        </div>
      </main>
    </>
  );
};

export default AdminPlayersPage;
