import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth/jwt";

/**
 * Extracts and verifies the access token from the request cookies.
 * Returns the userId or null if unauthorized.
 * Eliminates the repeated `cookies().get("accessToken") → verifyToken` pattern in every route.
 */
export async function getUserIdFromAuth(): Promise<{ userId: string; role?: string } | null> {
  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get("accessToken")?.value;
    if (!accessToken) return null;

    const payload = await verifyToken(accessToken);
    if (!payload || !payload.userId) return null;

    return { userId: payload.userId as string, role: payload.role as string | undefined };
  } catch {
    return null;
  }
}
