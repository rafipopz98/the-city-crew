"use client";

import { useState, useEffect } from "react";
import { CalendarPlus, AlertTriangle } from "lucide-react";
import MatchModal from "@/components/Admin/Matches/MatchModal";
import MatchesHeader from "@/components/Admin/Matches/MatchesHeader";
import MatchesTable from "@/components/Admin/Matches/MatchesTable";
import MatchesToolbar from "@/components/Admin/Matches/MatchesToolbar";
import CreateSeasonModal from "@/components/Admin/Matches/CreateSeasonModal";
import {
  getCurrentSeasonYear,
  getNextSeasonYear,
  isPreSeason,
} from "@/lib/seasonUtils";

const AdminMatchesPage = () => {
  const [search, setSearch] = useState("");
  const [season, setSeason] = useState("");
  const [competition, setCompetition] = useState("");
  const [status, setStatus] = useState("");
  const [seasons, setSeasons] = useState<Array<{ _id: string; year: string }>>(
    [],
  );
  const [openMatchModal, setOpenMatchModal] = useState(false);
  const [editingMatch, setEditingMatch] = useState<any>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [openSeasonModal, setOpenSeasonModal] = useState(false);
  const [seasonWarning, setSeasonWarning] = useState<{
    show: boolean;
    message: string;
    seasonYear: string;
  }>({ show: false, message: "", seasonYear: "" });
  const [showNewSeasonButton, setShowNewSeasonButton] = useState(false);

  useEffect(() => {
    fetchSeasons();
  }, []);

  const fetchSeasons = async () => {
    try {
      const response = await fetch("/api/admin/seasons");
      if (response.ok) {
        const data = await response.json();
        setSeasons(data);

        if (data.length > 0) {
          const currentSeasonYear = getCurrentSeasonYear();
          const preSeason = isPreSeason();

          // Try to find current season
          const currentSeason = data.find(
            (s: any) => s.year === currentSeasonYear,
          );

          if (currentSeason) {
            // Current season exists
            setSeason(currentSeason._id);
            setSeasonWarning({ show: false, message: "", seasonYear: "" });

            // Only show "New Season" button during pre-season
            if (preSeason) {
              const nextSeasonYear = getNextSeasonYear();
              const nextSeason = data.find(
                (s: any) => s.year === nextSeasonYear,
              );
              // Show button only if next season hasn't been created yet
              setShowNewSeasonButton(!nextSeason);
            } else {
              setShowNewSeasonButton(false);
            }
          } else {
            // Current season not found
            if (preSeason) {
              // Pre-season: look for upcoming season instead
              const nextSeasonYear = getNextSeasonYear();
              const nextSeason = data.find(
                (s: any) => s.year === nextSeasonYear,
              );

              if (nextSeason) {
                // Upcoming season already exists
                setSeason(nextSeason._id);
                setSeasonWarning({ show: false, message: "", seasonYear: "" });
                setShowNewSeasonButton(false); // Already created
              } else {
                // Upcoming season needs to be created
                setSeason(data[0]._id);
                setSeasonWarning({
                  show: true,
                  message: `Pre-season: Create the upcoming ${nextSeasonYear} season to start adding fixtures.`,
                  seasonYear: nextSeasonYear,
                });
                setShowNewSeasonButton(true);
              }
            } else {
              // Mid-season but season not found
              setSeason(data[0]._id);
              setSeasonWarning({
                show: true,
                message: `The ${currentSeasonYear} season hasn't been created yet.`,
                seasonYear: currentSeasonYear,
              });
              setShowNewSeasonButton(true); // Need to create it
            }
          }
        } else {
          // No seasons at all
          const nextSeasonYear = getCurrentSeasonYear();
          setSeasonWarning({
            show: true,
            message: `No seasons found. Create ${nextSeasonYear} to get started.`,
            seasonYear: nextSeasonYear,
          });
          setShowNewSeasonButton(true);
        }
      }
    } catch (error) {
      console.error("Error fetching seasons:", error);
    }
  };

  const handleEdit = (match: any) => {
    setEditingMatch(match);
    setOpenMatchModal(true);
  };

  const handleAddMatch = () => {
    if (seasons.length === 0) {
      setOpenSeasonModal(true);
      return;
    }
    setEditingMatch(null);
    setOpenMatchModal(true);
  };

  const handleSave = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  const handleSeasonCreated = () => {
    fetchSeasons();
    setRefreshTrigger((prev) => prev + 1);
  };

  return (
    <>
      <MatchModal
        open={openMatchModal}
        onClose={() => {
          setOpenMatchModal(false);
          setEditingMatch(null);
        }}
        onSave={handleSave}
        match={editingMatch}
        seasons={seasons}
      />

      <CreateSeasonModal
        open={openSeasonModal}
        onClose={() => setOpenSeasonModal(false)}
        onSeasonCreated={handleSeasonCreated}
      />

      <main className="min-h-screen bg-[#ece1cf]">
        <div className="w-full px-5">
          <MatchesHeader onAddMatch={handleAddMatch} />

          {/* Season Warning - Only shows when season is missing */}
          {seasonWarning.show && (
            <div className="mt-8 p-6 bg-yellow-50 border border-yellow-200">
              <div className="flex items-start gap-4">
                <div className="p-2 bg-yellow-100 shrink-0">
                  <AlertTriangle size={24} className="text-yellow-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-medium text-yellow-800 mb-2">
                    Season Required
                  </h3>
                  <p className="text-sm text-black/60 leading-relaxed mb-4">
                    {seasonWarning.message}
                  </p>
                  <button
                    onClick={() => setOpenSeasonModal(true)}
                    className="
                      inline-flex
                      items-center
                      gap-2
                      px-4
                      py-2.5
                      bg-yellow-600
                      text-white
                      text-sm
                      font-medium
                      hover:bg-yellow-700
                      transition-colors
                    "
                  >
                    <CalendarPlus size={16} />
                    Create {seasonWarning.seasonYear} Season
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="mt-12">
            <div className="flex flex-wrap items-end gap-4">
              <div className="flex-1">
                <MatchesToolbar
                  search={search}
                  onSearchChange={setSearch}
                  season={season}
                  onSeasonChange={setSeason}
                  competition={competition}
                  onCompetitionChange={setCompetition}
                  status={status}
                  onStatusChange={setStatus}
                  seasons={seasons}
                />
              </div>

              {/* "New Season" button only appears during pre-season or when needed */}
              {showNewSeasonButton && (
                <button
                  onClick={() => setOpenSeasonModal(true)}
                  className="
                    px-4 py-2.5
                    border border-dashed border-[#6CABDD]
                    text-[#6CABDD] text-sm font-medium
                    hover:bg-[#6CABDD]/5
                    transition-colors
                    flex items-center gap-2
                    whitespace-nowrap
                  "
                >
                  <CalendarPlus size={16} />
                  New Season
                </button>
              )}
            </div>
          </div>

          <div className="mt-10">
            <MatchesTable
              search={search}
              season={season}
              competition={competition}
              status={status}
              onEdit={handleEdit}
              refreshTrigger={refreshTrigger}
            />
          </div>
        </div>
      </main>
    </>
  );
};

export default AdminMatchesPage;
