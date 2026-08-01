import { NextResponse } from "next/server";
import { logError } from "@/lib/errorLogger";
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

    const {
      email,
      password,
      conversion_page,
      utm_params,
      first_landing_page,
    } = await req.json();

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

    const normalizedEmail = email.toLowerCase().trim();

    let user = await UserModel.findOne({ email: normalizedEmail });

    let signedUpFromLogin = false;

    // ── Sign in = Sign up ──────────────────────────────────────────────
    // If the email doesn't exist, create the account on the fly so the
    // user can get into the app immediately. They can complete their
    // name/username later from the profile-completion prompt.
    if (!user) {
      if (password.length < 6) {
        return NextResponse.json(
          {
            success: false,
            message: "Password must be at least 6 characters.",
          },
          { status: 400 },
        );
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      user = await UserModel.create({
        email: normalizedEmail,
        password: hashedPassword,
        signedUpFromLogin: true,
        ...(utm_params ? { utm_params } : {}),
        ...(first_landing_page ? { first_landing_page } : {}),
        ...(conversion_page ? { conversion_page } : {}),
      });
      signedUpFromLogin = true;
    } else {
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

    // ── Update conversion page if provided ─────────────────────────────
    if (conversion_page) {
      await UserModel.findByIdAndUpdate(userId, { conversion_page });
    }

    return NextResponse.json(
      {
        success: true,
        message: signedUpFromLogin
          ? "Account created. Welcome!"
          : "Logged in successfully.",
        signedUpFromLogin,
        data: {
          id: userId,
          email: user.email,
          role: user.role,
        },
      },
      { status: 200 },
    );
  } catch (error) {
    await logError("/api/auth/login", "POST", error);
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
