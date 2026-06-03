import type { Garrison, GarrisonStateKey } from "../../services/types";

const garrisonBase: Garrison = {
  floor: 2,
  nodeNameKey: "node.f2.crystalVault.name",
  nodeType: "medium",
  durationMin: 252,
  rewards: ["gold:1,240", "fragments:8", "stones:24"],
  capPct: 62,
  capInLabel: "5h 48m",
  capHours: 10,
  defenses: { wins: 3, losses: 0 },
  log: [
    { result: "win", opponent: "Mira", time: "time.minAgo:4", fresh: true },
    { result: "win", opponent: "Ardyn", time: "time.hourAgo:1" },
    { result: "win", opponent: "Joryn", time: "time.hourAgo:3" },
  ],
};

export const garrisonFixtures: Record<GarrisonStateKey, Garrison> = {
  normal: garrisonBase,
  capNear: {
    ...garrisonBase,
    capPct: 92,
    capInLabel: "41m",
    capUrgent: true,
    rewards: ["gold:2,980", "fragments:18", "stones:52"],
  },
  capFull: {
    ...garrisonBase,
    capPct: 100,
    capInLabel: "0m",
    capFull: true,
    rewards: ["gold:3,200", "fragments:20", "stones:60"],
    durationMin: 612,
  },
  empty: {
    ...garrisonBase,
    durationMin: 6,
    capPct: 2,
    capInLabel: "9h 54m",
    rewards: [],
    defenses: { wins: 0, losses: 0 },
    log: [],
  },
  lost: {
    ...garrisonBase,
    lost: true,
    lostTo: "Talen",
    capPct: 0,
    rewards: ["gold:1,240", "fragments:8", "stones:24"],
    defenses: { wins: 3, losses: 1 },
    log: [
      { result: "loss", opponent: "Talen", time: "time.minAgo:2", fresh: true },
      { result: "win", opponent: "Mira", time: "time.hourAgo:1" },
      { result: "win", opponent: "Ardyn", time: "time.hourAgo:2" },
    ],
  },
};

export function getGarrisonFixture(key?: string) {
  return key && key in garrisonFixtures
    ? garrisonFixtures[key as GarrisonStateKey]
    : garrisonFixtures.normal;
}
