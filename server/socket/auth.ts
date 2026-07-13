import { jwtVerify } from "jose";

type SocketUser = { id: string; name?: string };

function getSecret() {
  const secret = process.env.AUTH_SECRET?.trim();
  if (!secret) throw new Error("AUTH_SECRET missing");
  return new TextEncoder().encode(secret);
}

export async function verifySocketToken(token: string): Promise<SocketUser> {
  const { payload } = await jwtVerify(token, getSecret());
  const user = payload.user as SocketUser | undefined;
  if (!user?.id) throw new Error("Invalid token");
  return user;
}

export function verifyInternalSecret(header: string | undefined): boolean {
  const expected = process.env.INTERNAL_SOCKET_SECRET?.trim();
  if (!expected) return process.env.NODE_ENV !== "production";
  return header === expected;
}
