import type { Floor, PlayerState } from "../services/types";

export type HomePrimaryCta =
  | {
      kind: "viewBattle";
      labelKey: "common.viewBattle";
      to: "/battle/current";
    }
  | {
      kind: "claimRewards";
      labelKey: "home.cta.claimRewards";
      vars: { amount: string };
    }
  | {
      kind: "fightMajor" | "continueClimbing";
      labelKey: "home.cta.fightMajor" | "home.cta.continueClimbing";
      to: string;
    };

export function resolveHomePrimaryCta({
  claimAmount = "0",
  floor,
  playerState,
}: {
  claimAmount?: string;
  floor?: Floor;
  playerState: PlayerState;
}): HomePrimaryCta {
  if (playerState === "battle") {
    return {
      kind: "viewBattle",
      labelKey: "common.viewBattle",
      to: "/battle/current",
    };
  }

  if (playerState === "garrisoning") {
    return {
      kind: "claimRewards",
      labelKey: "home.cta.claimRewards",
      vars: { amount: claimAmount },
    };
  }

  const majorNode = floor?.nodes.find((node) => node.type === "major");
  const to = majorNode
    ? `/floor/${floor?.floor ?? 2}?node=${majorNode.id}`
    : "/floor/2";

  if (floor?.cleared) {
    return {
      kind: "continueClimbing",
      labelKey: "home.cta.continueClimbing",
      to,
    };
  }

  return {
    kind: "fightMajor",
    labelKey: "home.cta.fightMajor",
    to,
  };
}
