// app/api/player-ratings/route.ts
import { connectDB } from "@/lib/db/mongoose";
import { NextRequest, NextResponse } from "next/server";
import { logError } from "@/lib/errorLogger";
import PlayerRating from "@/lib/models/PlayerRating";
import { PlayersModels } from "@/lib/models/Players";
import { MatchesModel } from "@/lib/models/Matches";
import { getUserFromRequest } from "@/utils/getUserFromRequest";

// GET - Get players for a match with their ratings
export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const user = await getUserFromRequest(req);
    const { searchParams } = new URL(req.url);
    const matchId = searchParams.get("matchId");

    if (!matchId) {
      return NextResponse.json(
        { error: "Match ID is required" },
        { status: 400 },
      );
    }

    // Get the match with lineup
    const match = await MatchesModel.findById(matchId)
      .populate("lineup", "name position country vertical_image number")
      .lean();

    if (!match) {
      return NextResponse.json({ error: "Match not found" }, { status: 404 });
    }

    // Check if match is finished
    const isFinished = match.status === "finished";

    // Get user's existing ratings for these players
    let userRatings: Record<string, number> = {};
    if (user?.userId) {
      const ratings = await PlayerRating.find({
        match_id: matchId,
        user_id: user.userId,
        player_id: { $in: match.lineup.map((p: any) => p._id) },
      });
      ratings.forEach((r) => {
        userRatings[r.player_id.toString()] = r.rating;
      });
    }

    // Sort players: ST → MID → DEF → GK
    const positionOrder: Record<string, number> = {
      ST: 1,
      CF: 1,
      LW: 1,
      RW: 1,
      LF: 1,
      RF: 1,
      CM: 2,
      CDM: 2,
      CAM: 2,
      DM: 2,
      AM: 2,
      LM: 2,
      RM: 2,
      CB: 3,
      LB: 3,
      RB: 3,
      LWB: 3,
      RWB: 3,
      GK: 4,
    };

    const sortedPlayers = match.lineup
      .map((player: any) => ({
        ...player,
        positionOrder: positionOrder[player.position] || 99,
        userRating: userRatings[player._id.toString()] || null,
      }))
      .sort((a: any, b: any) => a.positionOrder - b.positionOrder);

    return NextResponse.json({
      players: sortedPlayers,
      isFinished,
      isLoggedIn: !!user?.userId,
      match,
    });
  } catch (error) {
    await logError("/api/player-ratings", "GET", error);
    console.error("Error fetching player ratings:", error);
    return NextResponse.json(
      { error: "Failed to fetch player ratings" },
      { status: 500 },
    );
  }
}

// POST - Save a player rating
export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const user = await getUserFromRequest(req);

    if (!user) {
      return NextResponse.json(
        { error: "You must be logged in to rate players" },
        { status: 401 },
      );
    }

    const body = await req.json();
    const { matchId, playerId, rating } = body;

    if (!matchId || !playerId || !rating) {
      return NextResponse.json(
        { error: "Match ID, Player ID, and rating are required" },
        { status: 400 },
      );
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: "Rating must be between 1 and 5" },
        { status: 400 },
      );
    }

    // Check if match is finished
    const match = await MatchesModel.findById(matchId);
    if (!match) {
      return NextResponse.json({ error: "Match not found" }, { status: 404 });
    }

    if (match.status !== "finished") {
      return NextResponse.json(
        { error: "Match must be finished to rate players" },
        { status: 400 },
      );
    }

    // ─── Check if it's a new rating or a re-vote ───
    const existingRating = await PlayerRating.findOne({
      match_id: matchId,
      player_id: playerId,
      user_id: user.userId,
    });

    if (existingRating) {
      // Re-vote — capture old rating first, then update
      const oldRating = existingRating.rating;
      existingRating.rating = rating;
      await existingRating.save();

      const diff = rating - oldRating;
      await PlayersModels.findByIdAndUpdate(playerId, {
        $inc: { rating: diff },
      });
    } else {
      // New rating — increment count and add stars
      await PlayerRating.create({
        match_id: matchId,
        player_id: playerId,
        user_id: user.userId,
        rating,
      });

      await PlayersModels.findByIdAndUpdate(playerId, {
        $inc: {
          total_ratings: 1,
          rating: rating,
        },
      });
    }

    return NextResponse.json({
      success: true,
      averageRating: rating,
      totalRatings: 1,
    });
  } catch (error) {
    await logError("/api/player-ratings", "POST", error);
    console.error("Error saving player rating:", error);
    return NextResponse.json(
      { error: "Failed to save rating" },
      { status: 500 },
    );
  }
}
