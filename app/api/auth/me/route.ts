import { NextResponse } from "next/server";
import { cookies } from "next/headers";

import { verifyToken } from "@/lib/auth/jwt";
import { connectDB } from "@/lib/db/mongoose";
import { UserModel } from "@/lib/models/User";

export async function GET() {
  try {
    await connectDB();

    const token = (await cookies()).get("accessToken")?.value;

    if (!token) {
      return NextResponse.json({ user: null });
    }

    const payload = await verifyToken(token);

    if (!payload) {
      return NextResponse.json({ user: null });
    }

    const user = await UserModel.findById(payload.userId).select(
      "first_name email",
    );

    if (!user) {
      return NextResponse.json({ user: null });
    }

    return NextResponse.json({
      user: {
        id: user._id.toString(),
        first_name: user.first_name,
        email: user.email,
      },
    });
  } catch {
    return NextResponse.json({ user: null });
  }
}
