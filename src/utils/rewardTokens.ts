import type { Reward, RewardType } from "../services/types";

export function parseRewardToken(token: string): Reward {
  const [rawType, rawValue = "0"] = token.split(":");
  const type = rawType as RewardType;

  if (type === "gear") {
    return { type, rarity: rawValue as Reward["rarity"] };
  }

  return {
    type,
    amount: Number(rawValue.replace(/,/g, "")),
  };
}

export function parseRewardTokens(tokens: string[]) {
  return tokens.map(parseRewardToken);
}

export function rewardTokenAmount(token: string) {
  return token.split(":")[1] ?? "0";
}
