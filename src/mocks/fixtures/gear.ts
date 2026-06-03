import type { Gear, GearSlot } from "../../services/types";

export const equippedCpBySlot: Record<GearSlot, number> = {
  weapon: 188,
  helmet: 64,
  armor: 246,
  ring: 132,
  necklace: 58,
  boots: 121,
};

export const gearDrop: Gear = {
  id: "drop_lichcleaver",
  slot: "weapon",
  tier: 3,
  nameKey: "gear.lichcleaver.name",
  rarity: "epic",
  cp: 232,
  level: 12,
  isNew: true,
  stats: [
    { k: "atk", v: 188 },
    { k: "crit", v: "9%" },
  ],
  attrs: {
    attack: 188,
    critRate: 9,
  },
};
