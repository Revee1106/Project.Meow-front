export type WinChanceBucket = "low" | "fair" | "high";

export function winChanceBucket(playerCP: number, recommendedCP: number): WinChanceBucket {
  const ratio = playerCP / recommendedCP;

  if (ratio >= 1.15) {
    return "high";
  }

  if (ratio >= 0.9) {
    return "fair";
  }

  return "low";
}
