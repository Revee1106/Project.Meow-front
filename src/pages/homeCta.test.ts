import { describe, expect, it } from "vitest";
import { floor2 } from "../mocks/tower";
import { resolveHomePrimaryCta } from "./homeCta";

describe("Home CTA matrix", () => {
  it("routes battle state to the active battle", () => {
    expect(
      resolveHomePrimaryCta({ playerState: "battle", floor: floor2 }),
    ).toEqual({
      kind: "viewBattle",
      labelKey: "common.viewBattle",
      to: "/battle/current",
    });
  });

  it("routes garrisoning state to reward claim with the visible amount", () => {
    expect(
      resolveHomePrimaryCta({
        playerState: "garrisoning",
        floor: floor2,
        claimAmount: "1,240",
      }),
    ).toEqual({
      kind: "claimRewards",
      labelKey: "home.cta.claimRewards",
      vars: { amount: "1,240" },
    });
  });

  it("routes free uncleared floors to the major-node fight", () => {
    expect(
      resolveHomePrimaryCta({
        playerState: "free",
        floor: { ...floor2, cleared: false },
      }),
    ).toEqual({
      kind: "fightMajor",
      labelKey: "home.cta.fightMajor",
      to: "/floor/2?node=n_major",
    });
  });

  it("routes free cleared floors to continue climbing", () => {
    expect(
      resolveHomePrimaryCta({ playerState: "free", floor: floor2 }),
    ).toEqual({
      kind: "continueClimbing",
      labelKey: "home.cta.continueClimbing",
      to: "/floor/2?node=n_major",
    });
  });
});
