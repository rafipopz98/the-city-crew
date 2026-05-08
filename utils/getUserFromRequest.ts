import { verifyToken } from "@/lib/auth/jwt";
import { NextRequest } from "next/server";

export const getUserFromRequest = async (req: NextRequest) => {
  const token = req.cookies.get("accessToken")?.value;

  if (!token) {
    return null;
  }

  const payload = await verifyToken(token);

  if (!payload) {
    return null;
  }

  return {
    userId: payload.userId,
    role: payload.role,
  };
};
