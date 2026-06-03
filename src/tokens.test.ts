import { describe, expect, it } from "vitest";
import { tokens } from "./tokens";

describe("tokens", () => {
  it("ports the prototype core colors", () => {
    expect(tokens.bg).toBe("#15131C");
    expect(tokens.gold).toBe("#E8B53C");
    expect(tokens.rarity.epic).toBe("#8A5BD6");
  });
});
