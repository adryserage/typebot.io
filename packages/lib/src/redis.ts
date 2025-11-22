import { env } from "@typebot.io/env";
import { Redis } from "ioredis";

declare const global: { redis: Redis | undefined };
let redis: Redis | undefined;

// Skip Redis initialization during Next.js build phase
const isBuildPhase =
  process.env.NEXT_PHASE === "phase-production-build" ||
  process.env.NEXT_PHASE === "phase-development-build" ||
  process.env.SKIP_ENV_CHECK === "true";

// Suppress DNS resolution errors during build
if (isBuildPhase) {
  // Intercept unhandledRejection events
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

  // Intercept error event listeners
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
            args[0].message.includes("ENOTFOUND") ||
            args[0].message.includes("[ioredis]"))
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

const createRedisInstance = (url: string): Redis | undefined => {
  try {
    const instance = new Redis(url, {
      lazyConnect: true,
      enableOfflineQueue: false,
      enableReadyCheck: false,
      retryStrategy: () => null,
      maxRetriesPerRequest: null,
      connectTimeout: 0,
      commandTimeout: 0,
      showFriendlyErrorStack: false,
    });
    instance.on("error", () => {
      // Silently handle connection errors
    });
    return instance;
  } catch {
    // Silently fail during build if DNS resolution fails
    return undefined;
  }
};

if (!isBuildPhase && env.REDIS_URL) {
  if (env.NODE_ENV === "production" && !process.versions.bun) {
    redis = createRedisInstance(env.REDIS_URL);
  } else {
    if (!global.redis) {
      global.redis = createRedisInstance(env.REDIS_URL);
    }
    redis = global.redis;
  }
}

export default redis;
