export const tokens = {
  bg: "#15131C",
  surface: "#1F1B29",
  surfaceRaised: "#2A2438",
  inset: "#100E18",
  borderSubtle: "#3A3247",
  borderStrong: "#5A4D72",
  textPrimary: "#F2ECDC",
  textSecondary: "#A89F8C",
  textMuted: "#6B6478",
  gold: "#E8B53C",
  goldDim: "#8a6b22",
  purple: "#8A5BD6",
  purpleDim: "#4d2f88",
  crimson: "#C8384B",
  crimsonDim: "#7a1f2c",
  teal: "#3FB8A1",
  tealDim: "#1f6b5a",
  npc: "#7A6E59",
  rarity: {
    common: "#9EA0A6",
    rare: "#3D8FE0",
    epic: "#8A5BD6",
    legendary: "#E8B53C",
  },
  fontUI:
    '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", "Noto Sans SC", "Noto Sans JP", "Noto Sans KR", system-ui, sans-serif',
  fontDisplay: '"Cinzel", "Times New Roman", serif',
  fontNum: '"Inter", system-ui, sans-serif',
} as const;

export type Tokens = typeof tokens;
