import { env } from "@typebot.io/env";
import { Redis } from "ioredis";

declare const global: { redis: Redis | undefined };
let redis: Redis | undefined;

// Skip Redis initialization during Next.js build phase
const isBuildPhase =
  process.env.NEXT_PHASE === "phase-production-build" ||
  process.env.NEXT_PHASE === "phase-development-build" ||
  process.env.SKIP_ENV_CHECK === "true";

if (!isBuildPhase && env.REDIS_URL) {
  if (env.NODE_ENV === "production" && !process.versions.bun) {
    redis = new Redis(env.REDIS_URL, {
      lazyConnect: true,
      retryStrategy: () => null,
      maxRetriesPerRequest: null,
    });
    redis.on("error", () => {
      // Silently handle connection errors
    });
  } else {
    if (!global.redis) {
      global.redis = new Redis(env.REDIS_URL, {
        lazyConnect: true,
        retryStrategy: () => null,
        maxRetriesPerRequest: null,
      });
      global.redis.on("error", () => {
        // Silently handle connection errors
      });
    }
    redis = global.redis;
  }
}

export default redis;
