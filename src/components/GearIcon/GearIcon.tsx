import type { GearSlot, Rarity } from "../../services/types";

const SLOT_PATHS: Record<GearSlot, string> = {
  weapon: "M14.5 3.5 20 9 10.5 18.5 8 16 17.5 6.5ZM8 16 5 19M5 19 4 20M5 19 9 20",
  helmet: "M5 13a7 7 0 0 1 14 0v3h-3v-2h-2v2h-2v-2h-2v2H5Z",
  armor: "M8 4l4 2 4-2 3 3-2 2v10H7V9L5 7Z",
  ring: "M12 9a5 5 0 1 0 .01 0ZM12 9l-1.5-4h3Z",
  necklace: "M5 5a10 8 0 0 0 14 0M12 13a2.4 2.4 0 1 0 .01 0Z",
  boots: "M8 4v10h6a3 3 0 0 1 3 3v2H6V4Z",
};

export interface GearIconProps {
  slot: GearSlot;
  rarity?: Rarity;
  size?: number;
}

export function GearIcon({ slot, rarity = "common", size = 24 }: GearIconProps) {
  return (
    <svg
      aria-hidden="true"
      className={`gear-icon gear-icon--${rarity}`}
      fill="none"
      height={size}
      viewBox="0 0 24 24"
      width={size}
    >
      <path
        d={SLOT_PATHS[slot]}
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.8"
      />
    </svg>
  );
}
