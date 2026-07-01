import { describe, expect, it } from "vitest";
import { getClientIp, isRateLimited } from "./rateLimit";

describe("isRateLimited", () => {
  it("allows requests up to the max within the window", () => {
    const key = "test:allow-up-to-max";
    for (let i = 0; i < 3; i++) {
      expect(isRateLimited(key, 3, 60_000)).toBe(false);
    }
  });

  it("blocks once the count exceeds max within the window", () => {
    const key = "test:blocks-over-max";
    for (let i = 0; i < 3; i++) isRateLimited(key, 3, 60_000);
    expect(isRateLimited(key, 3, 60_000)).toBe(true);
  });

  it("resets the count once the window has elapsed", () => {
    const key = "test:resets-after-window";
    for (let i = 0; i < 3; i++) isRateLimited(key, 3, -1); // already-expired window
    expect(isRateLimited(key, 3, 60_000)).toBe(false);
  });

  it("tracks separate keys independently", () => {
    expect(isRateLimited("test:key-a", 1, 60_000)).toBe(false);
    expect(isRateLimited("test:key-b", 1, 60_000)).toBe(false);
  });
});

describe("getClientIp", () => {
  it("reads the first address from x-forwarded-for", () => {
    const request = new Request("http://localhost", {
      headers: { "x-forwarded-for": "1.2.3.4, 5.6.7.8" },
    });
    expect(getClientIp(request)).toBe("1.2.3.4");
  });

  it("falls back to x-real-ip when x-forwarded-for is absent", () => {
    const request = new Request("http://localhost", {
      headers: { "x-real-ip": "9.9.9.9" },
    });
    expect(getClientIp(request)).toBe("9.9.9.9");
  });

  it("falls back to \"unknown\" when no IP headers are present", () => {
    const request = new Request("http://localhost");
    expect(getClientIp(request)).toBe("unknown");
  });
});
