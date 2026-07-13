import { jwtVerify } from "jose";
import { getJwtSecret } from "@/lib/jwt-secret";
import type { SessionUser } from "@/lib/auth";

export async function verifyTokenEdge(token: string): Promise<SessionUser | null> {
  try {
    const { payload } = await jwtVerify(token, getJwtSecret());
    return (payload.user as SessionUser) ?? null;
  } catch {
    return null;
  }
}
