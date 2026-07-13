/** Единый секрет JWT — в production обязателен AUTH_SECRET */
export function getJwtSecret(): Uint8Array {
  const secret = process.env.AUTH_SECRET?.trim();
  if (!secret && process.env.NODE_ENV === "production") {
    throw new Error("AUTH_SECRET is required in production");
  }
  return new TextEncoder().encode(secret || "haymarket-dev-only-not-for-production");
}
