export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { logger } = await import("@/lib/logger");
    logger.info("HayMarket server starting", {
      node: process.version,
      env: process.env.NODE_ENV,
      sentry: Boolean(process.env.SENTRY_DSN),
      stripe: Boolean(process.env.STRIPE_SECRET_KEY),
    });
  }
}

export async function onRequestError(
  err: Error,
  request: { path: string; method: string },
  context: { routerKind: string; routePath: string }
) {
  const { logger } = await import("@/lib/logger");
  logger.error("Request error", {
    message: err.message,
    path: request.path,
    method: request.method,
    route: context.routePath,
    router: context.routerKind,
  });

  if (process.env.SENTRY_DSN) {
    const Sentry = await import("@sentry/nextjs");
    Sentry.captureException(err, {
      extra: { path: request.path, method: request.method, route: context.routePath },
    });
  }
}
