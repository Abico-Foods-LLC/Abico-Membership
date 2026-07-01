import { describe, expect, it } from "vitest";
import {
  calculatePointsFromPurchase,
  getMembershipTier,
  getNextTier,
  getTotalPoints,
  MEMBERSHIP_TIERS,
} from "./loyalty";

describe("calculatePointsFromPurchase", () => {
  it("floors to whole points at ₮1,000 per point", () => {
    expect(calculatePointsFromPurchase(50000)).toBe(50);
    expect(calculatePointsFromPurchase(1999)).toBe(1);
    expect(calculatePointsFromPurchase(999)).toBe(0);
  });
});

describe("getTotalPoints", () => {
  it("sums EARN and subtracts REDEEM", () => {
    const total = getTotalPoints([
      { points: 100, type: "EARN" },
      { points: 30, type: "REDEEM" },
      { points: 50, type: "EARN" },
    ]);
    expect(total).toBe(120);
  });

  it("returns 0 for no transactions", () => {
    expect(getTotalPoints([])).toBe(0);
  });
});

describe("getMembershipTier", () => {
  it("returns the lowest tier below the first threshold", () => {
    expect(getMembershipTier(0).id).toBe("standard");
    expect(getMembershipTier(999).id).toBe("standard");
  });

  it("returns the tier matching each boundary exactly", () => {
    for (const tier of MEMBERSHIP_TIERS) {
      expect(getMembershipTier(tier.minPoints).id).toBe(tier.id);
    }
  });

  it("returns the top tier for very large point totals", () => {
    expect(getMembershipTier(1_000_000).id).toBe("vip");
  });
});

describe("getNextTier", () => {
  it("returns the tier directly above the current one", () => {
    expect(getNextTier(0)?.id).toBe("bronze");
    expect(getNextTier(1000)?.id).toBe("alt");
  });

  it("returns null once a member is already at the top tier", () => {
    expect(getNextTier(10000)).toBeNull();
  });
});
