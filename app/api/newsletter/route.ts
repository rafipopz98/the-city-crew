import { connectDB } from "@/lib/db/mongoose";
import NewsLetterModel from "@/lib/models/Newsletter";
import { NextRequest, NextResponse } from "next/server";
import { logError } from "@/lib/errorLogger";

// add newsletter email to db
export const POST = async (req: NextRequest) => {
  try {
    await connectDB();

    const body = await req.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json(
        { message: "Email is required" },
        { status: 400 },
      );
    }

    const existingEmail = await NewsLetterModel.findOne({ email });

    if (existingEmail) {
      return NextResponse.json(
        { message: "Email already exists" },
        { status: 400 },
      );
    }

    const newEmail = new NewsLetterModel({ email });
    await newEmail.save();

    return NextResponse.json(
      { message: "Email added to newsletter" },
      { status: 201 },
    );
  } catch (error) {
    await logError("/api/newsletter", "POST", error);
    console.error(error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 },
    );
  }
};
