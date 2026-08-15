import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/mongoose";
import { UserModel } from "@/lib/models/User";
import { getUserFromRequest } from "@/utils/getUserFromRequest";
import { logError } from "@/lib/errorLogger";

// PUT /api/auth/profile - Complete / update profile (name + username)
export async function PUT(req: NextRequest) {
  try {
    const user = await getUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { first_name, last_name, username } = body;

    await connectDB();

    const update: Record<string, unknown> = {};

    if (first_name !== undefined) {
      const trimmed = String(first_name).trim();
      if (trimmed.length < 1) {
        return NextResponse.json(
          { message: "First name is required" },
          { status: 400 },
        );
      }
      update.first_name = trimmed;
    }

    if (last_name !== undefined) {
      update.last_name = String(last_name).trim() || null;
    }

    // ── Username: required, validate + check uniqueness ────────────────
    // Required whenever a username is supplied at all, and whenever this
    // call is completing the profile (first_name being set) — the game,
    // quizzes & leaderboards all key off username, so a name-only profile
    // is no longer considered complete.
    if (username !== undefined && username !== null) {
      const trimmed = String(username).trim().toLowerCase();

      if (trimmed.length === 0) {
        return NextResponse.json(
          { message: "Username is required (min 3 characters)" },
          { status: 400 },
        );
      }

      if (trimmed.length < 3 || trimmed.length > 20) {
        return NextResponse.json(
          { message: "Username must be between 3 and 20 characters" },
          { status: 400 },
        );
      }
      if (!/^[a-z0-9_]+$/.test(trimmed)) {
        return NextResponse.json(
          {
            message:
              "Username can only contain lowercase letters, numbers, and underscores",
          },
          { status: 400 },
        );
      }

      const existing = await UserModel.findOne({
        username: trimmed,
        _id: { $ne: user.userId },
      });
      if (existing) {
        return NextResponse.json(
          { message: "Username is already taken" },
          { status: 409 },
        );
      }

      update.username = trimmed;
    } else if (first_name !== undefined) {
      return NextResponse.json(
        { message: "Username is required (min 3 characters)" },
        { status: 400 },
      );
    }

    // If they're filling in their name, mark the profile as complete
    if (update.first_name !== undefined) {
      update.profile_completed = true;
    }

    const updated = await UserModel.findByIdAndUpdate(user.userId, update, {
      returnDocument: "after",
      select: "first_name last_name email role username signedUpFromLogin profile_completed",
    });

    if (!updated) {
      return NextResponse.json(
        { message: "User not found" },
        { status: 404 },
      );
    }

    const displayName =
      updated.first_name ||
      updated.username ||
      (updated.email?.split("@")[0] ?? null) ||
      "City Crew Member";

    return NextResponse.json({
      message: "Profile updated successfully",
      user: {
        id: updated._id.toString(),
        first_name: updated.first_name || null,
        last_name: updated.last_name || null,
        email: updated.email,
        role: updated.role,
        username: updated.username || undefined,
        signedUpFromLogin: !!updated.signedUpFromLogin,
        profile_completed: !!updated.profile_completed,
        displayName,
      },
    });
  } catch (error) {
    await logError("/api/auth/profile", "PUT", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 },
    );
  }
}
