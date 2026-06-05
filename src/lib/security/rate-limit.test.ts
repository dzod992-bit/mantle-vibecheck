import { describe, expect, it } from "vitest";

import { FixedWindowRateLimiter } from "./rate-limit";

describe("FixedWindowRateLimiter", () => {
  it("blocks requests after the fixed-window allowance", () => {
    const limiter = new FixedWindowRateLimiter(2, 1_000);

    expect(limiter.consume("client", 1_000).allowed).toBe(true);
    expect(limiter.consume("client", 1_100).allowed).toBe(true);
    expect(limiter.consume("client", 1_200)).toMatchObject({
      allowed: false,
      remaining: 0,
    });
  });

  it("resets the allowance after the window expires", () => {
    const limiter = new FixedWindowRateLimiter(1, 1_000);

    expect(limiter.consume("client", 1_000).allowed).toBe(true);
    expect(limiter.consume("client", 1_500).allowed).toBe(false);
    expect(limiter.consume("client", 2_000).allowed).toBe(true);
  });
});
