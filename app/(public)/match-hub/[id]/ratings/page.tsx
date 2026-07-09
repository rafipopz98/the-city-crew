// page.tsx — Server Component (no "use client")
import { connectDB } from "@/lib/db/mongoose";
import { MatchesModel } from "@/lib/models/Matches";
import { notFound } from "next/navigation";
import { createMetadata } from "@/lib/seo";
import RatingsClient from "./client";

type Props = {
  params: Promise<{
    id: string;
  }>;
};

export async function generateMetadata({ params }: Props) {
  const { id } = await params;

  await connectDB();
  const match = await MatchesModel.findById(id).lean();

  if (!match) {
    return {
      title: "Match Not Found",
      description: "The requested match could not be found.",
    };
  }

  return createMetadata({
    title: `Rate Players | ${match.homeTeam?.name} vs ${match.awayTeam?.name}`,
    description: `Rate Manchester City players' performance in the match against ${match.awayTeam?.name}.`,
    path: `/match-hub/${id}/ratings`,
    keywords: [
      "player ratings",
      "rate players",
      "Manchester City",
      match.homeTeam?.name,
      match.awayTeam?.name,
    ],
  });
}

export default async function RatingsPage({ params }: Props) {
  const { id } = await params;

  await connectDB();

  const match = await MatchesModel.findById(id)
    .populate({
      path: "lineup",
      select: "name position country vertical_image number",
    })
    .lean();

  if (!match) {
    notFound();
  }

  const isFinished = match.status === "finished";

  return (
    <RatingsClient
      matchId={id}
      initialMatch={match}
      isFinished={isFinished}
      isLoggedIn={false}
    />
  );
}
