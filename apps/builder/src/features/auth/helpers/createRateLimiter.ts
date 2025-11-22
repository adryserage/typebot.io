import { env } from "@typebot.io/env";
import { Ratelimit } from "@upstash/ratelimit";
import Redis from "ioredis";

// Skip Redis initialization during Next.js build phase
const isBuildPhase =
  process.env.NEXT_PHASE === "phase-production-build" ||
  process.env.NEXT_PHASE === "phase-development-build" ||
  process.env.SKIP_ENV_CHECK === "true";

// Suppress DNS resolution errors during build
if (isBuildPhase) {
  const originalEmit = process.emit;
  process.emit = function (event: string | symbol, ...args: unknown[]) {
    if (
      event === "unhandledRejection" &&
      args[0] &&
      typeof args[0] === "object" &&
      "message" in args[0] &&
      typeof args[0].message === "string" &&
      (args[0].message.includes("getaddrinfo ENOTFOUND") ||
        args[0].message.includes("typebot-redis") ||
        args[0].message.includes("ENOTFOUND") ||
        args[0].message.includes("[ioredis]"))
    ) {
      return false;
    }
    return originalEmit.apply(this, [event, ...args]);
  };

  // Also suppress error events from ioredis
  const originalOn = process.on;
  process.on = function (
    event: string | symbol,
    listener: (...args: unknown[]) => void,
  ) {
    if (event === "unhandledRejection") {
      const wrappedListener = (...args: unknown[]) => {
        if (
          args[0] &&
          typeof args[0] === "object" &&
          "message" in args[0] &&
          typeof args[0].message === "string" &&
          (args[0].message.includes("getaddrinfo ENOTFOUND") ||
            args[0].message.includes("typebot-redis") ||
            args[0].message.includes("ENOTFOUND"))
        ) {
          return;
        }
        listener(...args);
      };
      return originalOn.call(this, event, wrappedListener);
    }
    return originalOn.call(this, event, listener);
  };
}

export const createRateLimiter = () => {
  if (!env.REDIS_URL) return;

  if (isBuildPhase) return;

  let redis: Redis;
  try {
    redis = new Redis(env.REDIS_URL, {
      lazyConnect: true,
      enableOfflineQueue: false,
      enableReadyCheck: false,
      retryStrategy: () => null,
      maxRetriesPerRequest: null,
      connectTimeout: 0,
      commandTimeout: 0,
      showFriendlyErrorStack: false,
    });
    redis.on("error", () => {
      // Silently handle connection errors
    });
  } catch {
    // Silently fail during build if DNS resolution fails
    return;
  }

  const rateLimitCompatibleRedis = {
    sadd: <TData>(key: string, ...members: TData[]) =>
      redis.sadd(key, ...members.map((m) => String(m))),
    eval: async <TArgs extends unknown[], TData = unknown>(
      script: string,
      keys: string[],
      args: TArgs,
    ) =>
      redis.eval(
        script,
        keys.length,
        ...keys,
        ...(args ?? []).map((a) => String(a)),
      ) as Promise<TData>,
  };

  return new Ratelimit({
    redis: rateLimitCompatibleRedis,
    limiter: Ratelimit.slidingWindow(1, "60 s"),
  });
};
