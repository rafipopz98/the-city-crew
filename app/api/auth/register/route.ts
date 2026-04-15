import { NextResponse } from "next/server";
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
    console.log("done with db");

    const { first_name, last_name, email, password } = await req.json();

    const normalizedEmail = email?.toLowerCase();

    // validation
    if (!first_name || !last_name || !normalizedEmail || !password) {
      return NextResponse.json(
        { message: "All fields are required" },
        { status: 400 },
      );
    }
    console.log("am i here");

    if (password.length < 6) {
      return NextResponse.json(
        { message: "Password must be at least 6 characters" },
        { status: 400 },
      );
    }

    // check existing user
    const existingUser = await UserModel.findOne({
      email: normalizedEmail,
      is_deleted: false,
    });
    console.log("ami here 2");

    if (existingUser) {
      return NextResponse.json(
        { message: "User already exists" },
        { status: 409 },
      );
    }

    // hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // create user
    const user = await UserModel.create({
      first_name,
      last_name,
      email: normalizedEmail,
      password: hashedPassword,
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
    console.log("ami here 3");

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
    console.log("REGISTER ERROR:", error);

    return NextResponse.json(
      { message: "Something went wrong" },
      { status: 500 },
    );
  }
}
