const memory = new Map<string, { count: number; reset: number }>();

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

/** In-memory rate limit for Edge middleware (per instance). */
export function rateLimitEdge(key: string, limit: number, windowSec = 60): boolean {
  return memoryLimit(key, limit, windowSec * 1000);
}
