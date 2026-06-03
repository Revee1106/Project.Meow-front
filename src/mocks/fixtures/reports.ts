import type { Report } from "../../services/types";
import { parseRewardTokens } from "../../utils/rewardTokens";

export const reportsFixture: Report[] = [
  {
    id: "r1",
    kind: "defenseWin",
    opponentName: "Mira",
    nodeNameKey: "node.f2.crystalVault.name",
    rewards: parseRewardTokens(["gold:60"]),
    time: "time.minAgo:4",
    unread: true,
  },
  {
    id: "r2",
    kind: "nodeLost",
    opponentName: "Talen",
    nodeNameKey: "node.f2.silentLamp.name",
    rewards: [],
    time: "time.minAgo:38",
    unread: true,
  },
  {
    id: "r3",
    kind: "attackWin",
    opponentName: "Ardyn",
    nodeNameKey: "node.f2.boneReliquary.name",
    rewards: parseRewardTokens(["gold:240", "fragments:3"]),
    time: "time.hourAgo:2",
    unread: false,
  },
  {
    id: "r4",
    kind: "defenseWin",
    opponentName: "Joryn",
    nodeNameKey: "node.f2.crystalVault.name",
    rewards: parseRewardTokens(["gold:60"]),
    time: "time.hourAgo:5",
    unread: false,
  },
  {
    id: "r5",
    kind: "attackLoss",
    opponentName: "Talen",
    nodeNameKey: "node.f2.lichWarden.name",
    rewards: [],
    time: "time.hourAgo:9",
    unread: false,
  },
];
