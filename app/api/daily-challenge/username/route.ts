import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/mongoose";
import { UserModel } from "@/lib/models/User";
import { getUserFromRequest } from "@/utils/getUserFromRequest";
import { logError } from "@/lib/errorLogger";

export async function PUT(req: NextRequest) {
  try {
    const user = await getUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { username } = body;

    if (!username || typeof username !== "string") {
      return NextResponse.json(
        { message: "Username is required" },
        { status: 400 },
      );
    }

    const trimmed = username.trim().toLowerCase();

    // Validate username
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

    await connectDB();

    // Check uniqueness
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

    await UserModel.findByIdAndUpdate(user.userId, { username: trimmed });

    return NextResponse.json({
      message: "Username updated successfully",
      username: trimmed,
    });
  } catch (error) {
    await logError("/api/daily-challenge/username", "PUT", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 },
    );
  }
}
