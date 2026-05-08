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

    // validation
    if (!email || !password) {
      return NextResponse.json(
        {
          success: false,
          message: "Email and password are required.",
        },
        { status: 400 },
      );
    }

    const user = await UserModel.findOne({
      email: email.toLowerCase().trim(),
    });

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "Email or password is incorrect.",
        },
        { status: 401 },
      );
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return NextResponse.json(
        {
          success: false,
          message: "Email or password is incorrect.",
        },
        { status: 401 },
      );
    }

    const userId = user._id.toString();

    // generate tokens
    const accessToken = await signAccessToken({
      userId,
      role: user.role,
    });

    const refreshToken = await signRefreshToken({
      userId,
      role: user.role,
    });

    // create session
    await createSession(userId, hashToken(refreshToken));

    // set cookies
    await setAuthCookies(accessToken, refreshToken);

    return NextResponse.json(
      {
        success: true,
        message: "Logged in successfully.",
        data: {
          id: userId,
          email: user.email,
          role: user.role,
        },
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("LOGIN_ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Something went wrong. Please try again.",
      },
      { status: 500 },
    );
  }
}
