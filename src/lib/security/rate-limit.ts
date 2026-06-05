type RateLimitResult = {
  allowed: boolean;
  remaining: number;
  retryAfterSeconds: number;
};

type Bucket = {
  count: number;
  resetAt: number;
};

export class FixedWindowRateLimiter {
  private readonly buckets = new Map<string, Bucket>();

  constructor(
    private readonly limit: number,
    private readonly windowMs: number,
  ) {}

  consume(key: string, now = Date.now()): RateLimitResult {
    this.prune(now);
    const current = this.buckets.get(key);

    if (current === undefined || current.resetAt <= now) {
      this.buckets.set(key, {
        count: 1,
        resetAt: now + this.windowMs,
      });
      return {
        allowed: true,
        remaining: this.limit - 1,
        retryAfterSeconds: Math.ceil(this.windowMs / 1_000),
      };
    }

    if (current.count >= this.limit) {
      return {
        allowed: false,
        remaining: 0,
        retryAfterSeconds: Math.max(
          1,
          Math.ceil((current.resetAt - now) / 1_000),
        ),
      };
    }

    current.count += 1;
    return {
      allowed: true,
      remaining: this.limit - current.count,
      retryAfterSeconds: Math.max(
        1,
        Math.ceil((current.resetAt - now) / 1_000),
      ),
    };
  }

  private prune(now: number) {
    if (this.buckets.size < 1_000) {
      return;
    }

    for (const [key, bucket] of this.buckets) {
      if (bucket.resetAt <= now) {
        this.buckets.delete(key);
      }
    }
  }
}

const auditLimiter = new FixedWindowRateLimiter(12, 60_000);
const reviewLimiter = new FixedWindowRateLimiter(6, 60_000);

export function rateLimitAuditRequest(request: Request): RateLimitResult {
  return auditLimiter.consume(`audit:${getClientKey(request)}`);
}

export function rateLimitReviewRequest(request: Request): RateLimitResult {
  return reviewLimiter.consume(`review:${getClientKey(request)}`);
}

export function rateLimitResponse(result: RateLimitResult): Response {
  return Response.json(
    { error: "Too many requests. Wait briefly and try again." },
    {
      status: 429,
      headers: {
        "retry-after": result.retryAfterSeconds.toString(),
        "x-ratelimit-remaining": "0",
      },
    },
  );
}

function getClientKey(request: Request): string {
  const forwardedFor = request.headers.get("x-forwarded-for");
  return (
    forwardedFor?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "local"
  );
}
