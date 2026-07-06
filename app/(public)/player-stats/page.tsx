import { createMetadata } from "@/lib/seo";
import PlayerHeroSlider from "@/components/PlayerStats/PlayerHeroSlider";

export const metadata = createMetadata({
  title: "Manchester City Squad & Player Stats",
  description:
    "Explore the Manchester City squad, player profiles, ratings, appearances, goals, assists, clean sheets and more from The City Crew.",
  path: "/player-stats",
  keywords: [
    "Manchester City players",
    "Manchester City squad",
    "Manchester City player stats",
    "Manchester City ratings",
    "Haaland stats",
    "Phil Foden stats",
    "Rodri stats",
    "MCFC squad",
  ],
});

export default function PlayersPage() {
  return (
    <div className="sm:mt-5 -mt-7">
      <PlayerHeroSlider />
    </div>
  );
}
