import { NextResponse } from "next/server";
import { cookies } from "next/headers";

import { verifyToken, signAccessToken, signRefreshToken } from "@/lib/auth/jwt";
import { hashToken } from "@/lib/auth/hash";

import { findSession, deleteSession, createSession } from "@/lib/db/session";
import { connectDB } from "@/lib/db/mongoose";

export async function POST() {
  try {
    await connectDB();

    const cookieStore = await cookies();
    const refreshToken = cookieStore.get("refreshToken")?.value;

    if (!refreshToken) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // 1. verify JWT
    const payload = await verifyToken(refreshToken);

    if (!payload) {
      return NextResponse.json({ message: "Invalid token" }, { status: 401 });
    }

    const userId = payload.userId as string;

    // 2. check session in DB
    const tokenHash = hashToken(refreshToken);
    const session = await findSession(tokenHash);

    if (!session) {
      return NextResponse.json(
        { message: "Session not found" },
        { status: 401 },
      );
    }

    // 3. OPTIONAL (but recommended): rotation
    await deleteSession(tokenHash);

    const newRefreshToken = await signRefreshToken({
      userId,
      role: payload.role,
    });
    await createSession(userId, hashToken(newRefreshToken));

    // 4. new access token
    const newAccessToken = await signAccessToken({
      userId,
      role: payload.role, // may be undefined if not included
    });

    // 5. set cookies again
    cookieStore.set("accessToken", newAccessToken, {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 15,
    });

    cookieStore.set("refreshToken", newRefreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    return NextResponse.json({ message: "Refreshed" });
  } catch (error) {
    return NextResponse.json(
      { message: "Something went wrong" },
      { status: 500 },
    );
  }
}
