import { NextResponse } from "next/server";
import { cookies } from "next/headers";

import { hashToken } from "@/lib/auth/hash";
import { deleteSession } from "@/lib/db/session";
import { connectDB } from "@/lib/db/mongoose";

export async function POST() {
  try {
    await connectDB();

    const cookieStore = await cookies();
    const refreshToken = cookieStore.get("refreshToken")?.value;

    // delete session if exists
    if (refreshToken) {
      const tokenHash = hashToken(refreshToken);
      await deleteSession(tokenHash);
    }

    // clear cookies
    cookieStore.delete("accessToken");
    cookieStore.delete("refreshToken");

    return NextResponse.json({ message: "Logged out" });
  } catch (error) {
    return NextResponse.json(
      { message: "Something went wrong" },
      { status: 500 },
    );
  }
}
