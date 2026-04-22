import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth/jwt";

export const getUserFromRequest = async () => {
  const cookieStore = await cookies();
  const token = cookieStore.get("accessToken")?.value;

  if (!token) return null;

  const payload = await verifyToken(token);

  if (!payload) return null;

  return {
    userId: payload.userId,
    role: payload.role,
  };
};
