import { env } from "@typebot.io/env";
import type { Ratelimit } from "@upstash/ratelimit";
import { createRateLimiter } from "../helpers/createRateLimiter";

declare const global: { rateLimiter: Ratelimit | undefined };

// Skip Redis initialization during Next.js build phase
const isBuildPhase =
  process.env.NEXT_PHASE === "phase-production-build" ||
  process.env.NEXT_PHASE === "phase-development-build" ||
  process.env.SKIP_ENV_CHECK === "true";

if (!global.rateLimiter && env.REDIS_URL && !isBuildPhase) {
  global.rateLimiter = createRateLimiter();
}

export default global.rateLimiter;
