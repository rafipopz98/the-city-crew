import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { connectDB } from "@/lib/db/mongoose";
import { UserModel } from "@/lib/models/User";
import { verifyToken } from "@/lib/auth/jwt";
import { logError } from "@/lib/errorLogger";

export async function GET(req: NextRequest) {
  try {
    // Admin auth check
    const accessToken = (await cookies()).get("accessToken")?.value;
    if (!accessToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const payload = await verifyToken(accessToken);
    if (!payload) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const adminUser = await UserModel.findById(payload.userId).select("role");
    if (!adminUser || adminUser.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const search = searchParams.get("search") || "";

    let query: any = { is_deleted: false };

    if (search) {
      query.$or = [
        { first_name: { $regex: search, $options: "i" } },
        { last_name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }

    const totalUsers = await UserModel.countDocuments(query);
    const totalPages = Math.ceil(totalUsers / limit);
    const skip = (page - 1) * limit;

    const users = await UserModel.find(query)
      .select("-password")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    return NextResponse.json({
      users,
      currentPage: page,
      totalPages,
      totalUsers,
      usersPerPage: limit,
    });
  } catch (error) {
    await logError("/api/admin/users", "GET", error);
    console.error("Error fetching users:", error);
    return NextResponse.json(
      { error: "Failed to fetch users" },
      { status: 500 },
    );
  }
}
