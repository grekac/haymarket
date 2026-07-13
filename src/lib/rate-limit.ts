const memory = new Map<string, { count: number; reset: number }>();

const limiters = new Map<string, import("@upstash/ratelimit").Ratelimit>();

async function getUpstashLimiter(limit: number, windowSec: number) {
  if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
    return null;
  }

  const key = `${limit}:${windowSec}`;
  if (!limiters.has(key)) {
    const { Ratelimit } = await import("@upstash/ratelimit");
    const { Redis } = await import("@upstash/redis");
    const redis = Redis.fromEnv();
    limiters.set(
      key,
      new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(limit, `${windowSec} s`),
        analytics: true,
        prefix: "haymarket",
      })
    );
  }
  return limiters.get(key)!;
}
function memoryLimit(key: string, limit: number, windowMs: number) {
  const now = Date.now();
  const entry = memory.get(key);
  if (!entry || now > entry.reset) {
    memory.set(key, { count: 1, reset: now + windowMs });
    return true;
  }
  if (entry.count >= limit) return false;
  entry.count++;
  return true;
}

export async function rateLimit(key: string, limit: number, windowSec = 60): Promise<boolean> {
  const upstash = await getUpstashLimiter(limit, windowSec);  if (upstash) {
    const { success } = await upstash.limit(key);
    return success;
  }
  return memoryLimit(key, limit, windowSec * 1000);
}

export function rateLimitBackend() {
  return process.env.UPSTASH_REDIS_REST_URL ? "upstash" : "memory";
}
