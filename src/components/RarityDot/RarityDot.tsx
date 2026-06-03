import type { Rarity } from "../../services/types";

export interface RarityDotProps {
  rarity: Rarity;
}

export function RarityDot({ rarity }: RarityDotProps) {
  return <span aria-hidden="true" className={`rarity-dot rarity-dot--${rarity}`} />;
}
