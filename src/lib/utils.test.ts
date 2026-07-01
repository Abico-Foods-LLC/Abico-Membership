import { describe, expect, it } from "vitest";
import { cn, phoneSchema } from "./utils";

describe("phoneSchema", () => {
  it("accepts exactly 8 digits", () => {
    expect(phoneSchema.safeParse("99112233").success).toBe(true);
  });

  it("rejects non-numeric characters", () => {
    expect(phoneSchema.safeParse("9911abcd").success).toBe(false);
  });

  it("rejects the wrong length", () => {
    expect(phoneSchema.safeParse("991122").success).toBe(false);
    expect(phoneSchema.safeParse("991122334").success).toBe(false);
  });
});

describe("cn", () => {
  it("joins truthy class names with a space", () => {
    expect(cn("a", "b", "c")).toBe("a b c");
  });

  it("drops falsy values", () => {
    expect(cn("a", false, null, undefined, "b")).toBe("a b");
  });
});
