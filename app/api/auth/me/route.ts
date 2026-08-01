import { NextResponse } from "next/server";
import { cookies } from "next/headers";

import { verifyToken } from "@/lib/auth/jwt";
import { connectDB } from "@/lib/db/mongoose";
import { UserModel } from "@/lib/models/User";

export async function GET() {
  try {
    await connectDB();

    const accessToken = (await cookies()).get("accessToken")?.value;

    if (!accessToken) {
      return NextResponse.json(
        {
          message: "Access token missing.",
        },
        {
          status: 401,
        },
      );
    }

    const payload = await verifyToken(accessToken);

    if (!payload) {
      return NextResponse.json(
        {
          message: "Access token expired.",
        },
        {
          status: 401,
        },
      );
    }

    const user = await UserModel.findById(payload.userId).select(
      "first_name last_name email role username signedUpFromLogin profile_completed",
    );

    if (!user) {
      return NextResponse.json(
        {
          message: "User not found.",
        },
        {
          status: 404,
        },
      );
    }

    const displayName =
      user.first_name ||
      user.username ||
      (user.email?.split("@")[0] ?? null) ||
      "City Crew Member";

    return NextResponse.json({
      user: {
        id: user._id.toString(),
        first_name: user.first_name || null,
        last_name: user.last_name || null,
        email: user.email,
        role: user.role,
        username: user.username || undefined,
        signedUpFromLogin: !!user.signedUpFromLogin,
        profile_completed: !!user.profile_completed,
        displayName,
      },
    });
  } catch (error) {
    console.error("ME_ROUTE_ERROR:", error);

    return NextResponse.json(
      {
        message: "Something went wrong.",
      },
      {
        status: 500,
      },
    );
  }
}
