import { NextResponse } from "next/server";
import { logError } from "@/lib/errorLogger";
import bcrypt from "bcryptjs";

import { connectDB } from "@/lib/db/mongoose";
import { UserModel } from "@/lib/models/User";
import { signAccessToken, signRefreshToken } from "@/lib/auth/jwt";
import { createSession } from "@/lib/db/session";
import { hashToken } from "@/lib/auth/hash";
import { setAuthCookies } from "@/lib/auth/cookies";

export async function POST(req: Request) {
  try {
    await connectDB();

    const { first_name, last_name, username, email, password, utm_params, first_landing_page, conversion_page } =
      await req.json();

    const normalizedEmail = email?.toLowerCase();

    // Only email + password are required — name/username can be completed
    // later from the profile-completion prompt.
    if (!normalizedEmail || !password) {
      return NextResponse.json(
        { message: "Email and password are required" },
        { status: 400 },
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { message: "Password must be at least 6 characters" },
        { status: 400 },
      );
    }

    // check if username already taken
    if (username) {
      const existingUsername = await UserModel.findOne({ username: username.toLowerCase() });
      if (existingUsername) {
        return NextResponse.json(
          { message: "Username already taken" },
          { status: 409 },
        );
      }
    }

    // check existing user
    const existingUser = await UserModel.findOne({
      email: normalizedEmail,
      is_deleted: false,
    });

    if (existingUser) {
      return NextResponse.json(
        { message: "User already exists" },
        { status: 409 },
      );
    }

    // hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // create user — name/username optional, filled later via profile prompt
    const user = await UserModel.create({
      ...(first_name ? { first_name } : {}),
      ...(last_name ? { last_name } : {}),
      email: normalizedEmail,
      password: hashedPassword,
      ...(username ? { username: username.toLowerCase() } : {}),
      ...(utm_params ? { utm_params } : {}),
      ...(first_landing_page ? { first_landing_page } : {}),
      ...(conversion_page ? { conversion_page } : {}),
    });

    const userId = user._id.toString();

    // tokens
    const accessToken = await signAccessToken({
      userId,
      role: user.role,
    });

    const refreshToken = await signRefreshToken({
      userId,
      role: user.role,
    });

    // session
    await createSession(userId, hashToken(refreshToken));

    // cookies
    await setAuthCookies(accessToken, refreshToken);

    return NextResponse.json(
      {
        message: "User created successfully",
        user: {
          id: userId,
          email: user.email,
          role: user.role,
        },
      },
      { status: 201 },
    );
  } catch (error) {
    await logError("/api/auth/register", "POST", error);
    console.log("REGISTER ERROR:", error);

    return NextResponse.json(
      { message: "Something went wrong" },
      { status: 500 },
    );
  }
}
