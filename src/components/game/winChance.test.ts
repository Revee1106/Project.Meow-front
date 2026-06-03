import { describe, expect, it } from "vitest";
import { winChanceBucket } from "./winChance";

describe("winChanceBucket", () => {
  it.each([
    [899, 1000, "low"],
    [900, 1000, "fair"],
    [1149, 1000, "fair"],
    [1150, 1000, "high"],
  ] as const)(
    "maps %i CP against %i recommended CP to %s",
    (playerCP, recommendedCP, bucket) => {
      expect(winChanceBucket(playerCP, recommendedCP)).toBe(bucket);
    },
  );
});
