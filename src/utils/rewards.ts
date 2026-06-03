import type { Reward, RewardType } from "../services/types";

const REWARD_TYPES = new Set<RewardType>([
  "gold",
  "stones",
  "fragments",
  "tickets",
  "gear",
]);

export function rewardMapToList(rewards: Partial<Record<RewardType, number>>): Reward[] {
  return Object.entries(rewards)
    .filter((entry): entry is [RewardType, number] => {
      const [type, amount] = entry;
      return REWARD_TYPES.has(type as RewardType) && amount !== undefined;
    })
    .map(([type, amount]) => ({ type, amount }));
}
