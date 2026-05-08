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
      "first_name email role",
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

    return NextResponse.json({
      user: {
        id: user._id.toString(),
        first_name: user.first_name,
        email: user.email,
        role: user.role,
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
