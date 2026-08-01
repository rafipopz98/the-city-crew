import { connectDB } from "@/lib/db/mongoose";
import { MatchesModel } from "@/lib/models/Matches";
import mongoose from "mongoose";
import { NextRequest, NextResponse } from "next/server";
import { logError } from "@/lib/errorLogger";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(req: NextRequest, { params }: RouteContext) {
  try {
    await connectDB();

    const { id } = await params;

    const match = await MatchesModel.findById(id)
      .populate("season", "year")
      .lean();

    if (!match) {
      return NextResponse.json({ error: "Match not found" }, { status: 404 });
    }

    return NextResponse.json(match);
  } catch (error) {
    await logError("/api/admin/matches/[id]", "GET", error);
    console.error("Error fetching match:", error);
    return NextResponse.json(
      { error: "Failed to fetch match" },
      { status: 500 },
    );
  }
}

export async function PUT(req: NextRequest, { params }: RouteContext) {
  try {
    await connectDB();

    const { id } = await params;
    const body = await req.json();

    console.log("Received PUT body:", JSON.stringify(body, null, 2));

    // ✅ Build update object with all fields
    const updateData: any = {
      homeTeamScore: body.homeTeamScore,
      awayTeamScore: body.awayTeamScore,
      goalScorers: body.goalScorers || [],
      lineup: body.lineup || [],
    };

    // Only include other fields if they exist
    if (body.status) updateData.status = body.status;
    if (body.competition) updateData.competition = body.competition;
    if (body.matchType) updateData.matchType = body.matchType;
    if (body.venue) updateData.venue = body.venue;
    if (body.matchday !== undefined) updateData.matchday = body.matchday;
    if (body.formation !== undefined) updateData.formation = body.formation;
    if (body.isHome !== undefined) updateData.isHome = body.isHome;
    if (body.matchDate) updateData.matchDate = body.matchDate;
    if (body.homeTeam) updateData.homeTeam = body.homeTeam;
    if (body.awayTeam) updateData.awayTeam = body.awayTeam;

    console.log("Update data:", JSON.stringify(updateData, null, 2));

    const match = await MatchesModel.findByIdAndUpdate(
      id,
      { $set: updateData },
      {
        runValidators: false,
        returnDocument: "after",
      },
    )
      .populate("season", "year")
      .populate("lineup", "name")
      .lean();

    if (!match) {
      return NextResponse.json({ error: "Match not found" }, { status: 404 });
    }

    console.log("Updated match:", JSON.stringify(match, null, 2));

    return NextResponse.json(match);
  } catch (error) {
    await logError("/api/admin/matches/[id]", "PUT", error);
    console.error("Error updating match:", error);
    return NextResponse.json(
      { error: "Failed to update match" },
      { status: 500 },
    );
  }
}

export async function DELETE(req: NextRequest, { params }: RouteContext) {
  try {
    await connectDB();

    const { id } = await params;

    const match = await MatchesModel.findByIdAndDelete(id);

    if (!match) {
      return NextResponse.json({ error: "Match not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Match deleted successfully" });
  } catch (error) {
    await logError("/api/admin/matches/[id]", "DELETE", error);
    console.error("Error deleting match:", error);
    return NextResponse.json(
      { error: "Failed to delete match" },
      { status: 500 },
    );
  }
}
