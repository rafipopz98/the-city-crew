import { NextResponse } from "next/server";
import { signAccessToken, signRefreshToken } from "@/lib/auth/jwt";
import { setAuthCookies } from "@/lib/auth/cookies";
import { hashToken } from "@/lib/auth/hash";
import bcrypt from "bcryptjs";

import { createSession } from "@/lib/db/session";
import { connectDB } from "@/lib/db/mongoose";
import { UserModel } from "@/lib/models/User";

export async function POST(req: Request) {
  try {
    await connectDB();

    const { email, password } = await req.json();

    const user = await UserModel.findOne({ email });

    if (!user) {
      return NextResponse.json(
        { message: "Invalid credentials" },
        { status: 401 },
      );
    }

    const isValid = await bcrypt.compare(password, user.password);

    if (!isValid) {
      return NextResponse.json(
        { message: "Invalid credentials" },
        { status: 401 },
      );
    }

    const userId = user._id.toString();

    // tokens
    const accessToken = await signAccessToken({
      userId,
      role: user.role,
    });

    const refreshToken = await signRefreshToken({
      userId,
    });

    // store session
    await createSession(userId, hashToken(refreshToken));

    // cookies
    await setAuthCookies(accessToken, refreshToken);

    return NextResponse.json({
      message: "Login successful",
      user: {
        id: userId,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { message: "Something went wrong" },
      { status: 500 },
    );
  }
}
