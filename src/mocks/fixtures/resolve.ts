import type { BattleResolveLogEntry } from "../../services/types";

export const resolveLog: BattleResolveLogEntry[] = [
  { side: "me", key: "resolve.log.open", vars: {} },
  { side: "enemy", key: "resolve.log.enemyHit", vars: { dmg: 1120 } },
  { side: "me", key: "resolve.log.crit", vars: { dmg: 2240 } },
  { side: "enemy", key: "resolve.log.enemyHit", vars: { dmg: 980 } },
  { side: "me", key: "resolve.log.skill", vars: { dmg: 1860 } },
  { side: "me", key: "resolve.log.finish", vars: {} },
];
