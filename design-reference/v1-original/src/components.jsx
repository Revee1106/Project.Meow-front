// Reusable component library for Tower PvP hi-fi mockups.
// Dark-fantasy tokens, the phone frame, and every shared UI atom.

const T = window.TowerI18n.t;
const L = window.TowerI18n.LocaleText;

// ===== design tokens =====
const tokens = {
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
  fontUI: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", "Noto Sans SC", "Noto Sans JP", "Noto Sans KR", system-ui, sans-serif',
  fontDisplay: '"Cinzel", "Times New Roman", serif',
  fontNum: '"Inter", system-ui, sans-serif',
};

// inject once
if (typeof document !== "undefined" && !document.getElementById("tw-tokens")) {
  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = "https://fonts.googleapis.com/css2?family=Cinzel:wght@500;700&family=Inter:wght@400;500;600;700&display=swap";
  document.head.appendChild(link);

  const s = document.createElement("style");
  s.id = "tw-tokens";
  s.textContent = `
    .tw-root { font-family: ${tokens.fontUI}; color: ${tokens.textPrimary}; -webkit-font-smoothing: antialiased; }
    .tw-root *, .tw-root *::before, .tw-root *::after { box-sizing: border-box; }
    .tw-num { font-variant-numeric: tabular-nums; font-weight: 700; }
    .tw-display { font-family: ${tokens.fontDisplay}; letter-spacing: 0.02em; }
    .tw-scroll::-webkit-scrollbar { display: none; }
    .tw-scroll { scrollbar-width: none; }
    @keyframes tw-pulse { 0%,100% { opacity: 1 } 50% { opacity: .6 } }
    @keyframes tw-spin { to { transform: rotate(360deg) } }
    @keyframes tw-shimmer { 0% { background-position: -200% 0 } 100% { background-position: 200% 0 } }
  `;
  document.head.appendChild(s);
}

// ===== Phone frame =====
function PhoneFrame({ width = 360, height = 760, children, modal = null }) {
  return (
    <div
      className="tw-root"
      style={{
        width,
        height,
        background: "#070509",
        borderRadius: 32,
        padding: 8,
        boxShadow: "0 10px 40px rgba(0,0,0,.5), 0 0 0 1px #2a2438",
        position: "relative",
      }}
    >
      <div
        style={{
          width: "100%",
          height: "100%",
          background: tokens.bg,
          borderRadius: 24,
          overflow: "hidden",
          position: "relative",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* status bar */}
        <div
          style={{
            height: 28,
            paddingInline: 20,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            fontSize: 11,
            fontWeight: 600,
            color: tokens.textSecondary,
            flex: "0 0 auto",
          }}
        >
          <span>21:42</span>
          <span style={{ display: "flex", gap: 4, alignItems: "center" }}>
            <span>●●●</span>
            <span>5G</span>
            <span style={{
              width: 18, height: 9, border: `1px solid ${tokens.textSecondary}`,
              borderRadius: 2, display: "inline-block", padding: 1,
            }}>
              <span style={{ display: "block", height: "100%", width: "78%", background: tokens.textSecondary, borderRadius: 1 }}></span>
            </span>
          </span>
        </div>
        {/* main */}
        <div style={{ flex: "1 1 auto", display: "flex", flexDirection: "column", minHeight: 0, position: "relative" }}>
          {children}
        </div>
        {/* modal overlay */}
        {modal}
      </div>
    </div>
  );
}

// ===== State banner =====
function StateBanner({ state, nodeName }) {
  let bg, border, accent, glyph, titleKey, hintKey, vars;
  if (state === "free") {
    bg = "rgba(63,184,161,.10)";
    border = tokens.tealDim;
    accent = tokens.teal;
    glyph = "⚔";
    titleKey = "state.free.title";
    hintKey = "state.free.hint";
  } else if (state === "garrisoning") {
    bg = "rgba(138,91,214,.16)";
    border = tokens.purpleDim;
    accent = tokens.purple;
    glyph = "⛨";
    titleKey = "state.garrisoning.title";
    hintKey = "state.garrisoning.hint";
    vars = { nodeName };
  } else if (state === "battle") {
    bg = "rgba(200,56,75,.16)";
    border = tokens.crimsonDim;
    accent = tokens.crimson;
    glyph = "⚡";
    titleKey = "state.inBattle.title";
    hintKey = "state.inBattle.hint";
  } else if (state === "blocked") {
    bg = "rgba(200,56,75,.10)";
    border = tokens.crimsonDim;
    accent = tokens.crimson;
    glyph = "⛔";
    titleKey = "state.blocked.title";
    hintKey = "state.blocked.hint";
    vars = { nodeName };
  }
  return (
    <div
      style={{
        background: bg,
        borderBottom: `1px solid ${border}`,
        paddingInline: 14,
        paddingBlock: 8,
        display: "flex",
        gap: 10,
        alignItems: "flex-start",
        flex: "0 0 auto",
      }}
    >
      <div
        style={{
          flex: "0 0 auto",
          width: 22, height: 22, borderRadius: 6,
          background: accent + "26", color: accent,
          display: "grid", placeItems: "center",
          fontSize: 13, fontWeight: 700,
        }}
      >
        {glyph}
      </div>
      <div style={{ flex: "1 1 auto", minWidth: 0 }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: accent, lineHeight: 1.2 }}>
          {T(titleKey, vars)}
        </div>
        <div style={{ fontSize: 11, color: tokens.textSecondary, marginTop: 2, lineHeight: 1.3 }}>
          {T(hintKey, vars)}
        </div>
      </div>
    </div>
  );
}

// ===== Buttons =====
function Btn({ variant = "primary", disabled, onClick, children, fullWidth, small, style }) {
  const palette = {
    primary: { bg: tokens.gold, fg: "#1a1206", border: "transparent", shadow: `0 0 0 1px rgba(232,181,60,.4), 0 2px 0 ${tokens.goldDim}` },
    secondary: { bg: "transparent", fg: tokens.textPrimary, border: tokens.borderStrong, shadow: "none" },
    danger: { bg: tokens.crimson, fg: tokens.textPrimary, border: "transparent", shadow: `0 2px 0 ${tokens.crimsonDim}` },
    ghost: { bg: tokens.surfaceRaised, fg: tokens.textPrimary, border: tokens.borderSubtle, shadow: "none" },
  }[variant];
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        width: fullWidth ? "100%" : undefined,
        minHeight: small ? 32 : 44,
        paddingInline: small ? 12 : 16,
        paddingBlock: small ? 6 : 10,
        background: disabled ? tokens.surfaceRaised : palette.bg,
        color: disabled ? tokens.textMuted : palette.fg,
        border: `1px solid ${disabled ? tokens.borderSubtle : palette.border}`,
        borderRadius: small ? 6 : 10,
        boxShadow: disabled ? "none" : palette.shadow,
        fontFamily: tokens.fontUI,
        fontSize: small ? 12 : 14,
        fontWeight: 700,
        letterSpacing: 0.2,
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.7 : 1,
        textWrap: "balance",
        lineHeight: 1.2,
        ...style,
      }}
    >
      {children}
    </button>
  );
}

// ===== Reward chip =====
const REWARD_ICONS = {
  gold: { glyph: "⛃", color: tokens.gold, label: "res.gold" },
  stones: { glyph: "◈", color: tokens.rarity.rare, label: "res.stones" },
  fragments: { glyph: "✦", color: tokens.purple, label: "res.fragments" },
  tickets: { glyph: "🜚", color: tokens.crimson, label: "res.tickets" },
  gear: { glyph: "⚒", color: tokens.gold, label: "res.gear" },
};

function RewardChip({ type, amount, rarity }) {
  const meta = REWARD_ICONS[type] || REWARD_ICONS.gold;
  const isGear = type === "gear";
  const c = isGear && rarity ? tokens.rarity[rarity] : meta.color;
  const display = isGear ? T(`rarity.${rarity || "common"}`) : amount;
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 4,
        background: tokens.inset,
        border: `1px solid ${tokens.borderSubtle}`,
        borderRadius: 6,
        paddingInline: 6,
        paddingBlock: 3,
        fontSize: 11,
        fontWeight: 600,
        color: tokens.textPrimary,
      }}
    >
      <span style={{ color: c, fontSize: 12, lineHeight: 1 }}>{meta.glyph}</span>
      <span className="tw-num">{display}</span>
    </span>
  );
}

function RewardList({ rewards, compact }) {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
      {rewards.map((r, i) => {
        const [type, val] = r.split(":");
        if (type === "gear") return <RewardChip key={i} type="gear" rarity={val} />;
        return <RewardChip key={i} type={type} amount={val} />;
      })}
    </div>
  );
}

// ===== Node badges =====
function NodeStateBadge({ state, occupierName, protectionMin }) {
  const palette = {
    npcControlled: { bg: tokens.npc + "26", fg: tokens.npc, glyph: "⚔" },
    available: { bg: tokens.teal + "20", fg: tokens.teal, glyph: "●" },
    playerOccupied: { bg: tokens.crimson + "22", fg: tokens.crimson, glyph: "⚑" },
    occupiedByMe: { bg: tokens.gold + "22", fg: tokens.gold, glyph: "⛨" },
    protected: { bg: tokens.borderSubtle, fg: tokens.textSecondary, glyph: "⏳" },
    locked: { bg: tokens.borderSubtle, fg: tokens.textMuted, glyph: "🔒" },
    cleared: { bg: tokens.teal + "20", fg: tokens.teal, glyph: "✓" },
  }[state] || { bg: tokens.borderSubtle, fg: tokens.textSecondary, glyph: "?" };

  let label;
  if (state === "playerOccupied") label = T("node.state.playerOccupied", { player: occupierName });
  else if (state === "protected") label = T("node.state.protected", { time: `${protectionMin}m` });
  else label = T(`node.state.${state}`);

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 4,
        background: palette.bg,
        color: palette.fg,
        borderRadius: 4,
        paddingInline: 6,
        paddingBlock: 2,
        fontSize: 10,
        fontWeight: 700,
        letterSpacing: 0.3,
        textTransform: "uppercase",
      }}
    >
      <span style={{ fontSize: 10, lineHeight: 1 }}>{palette.glyph}</span>
      {label}
    </span>
  );
}

function NodeTypeBadge({ type }) {
  const palette = {
    major: { bg: tokens.crimson + "1a", fg: tokens.crimson },
    medium: { bg: tokens.purple + "1a", fg: tokens.purple },
    small: { bg: tokens.borderSubtle, fg: tokens.textSecondary },
  }[type];
  return (
    <span
      style={{
        background: palette.bg,
        color: palette.fg,
        borderRadius: 4,
        paddingInline: 6,
        paddingBlock: 2,
        fontSize: 10,
        fontWeight: 700,
        letterSpacing: 0.3,
        textTransform: "uppercase",
      }}
    >
      {T(`node.type.${type}.short`)}
    </span>
  );
}

// ===== Red dot =====
function RedDot({ count, dotOnly, style }) {
  if (dotOnly || !count) {
    return (
      <span
        style={{
          width: 7, height: 7, borderRadius: "50%",
          background: tokens.crimson,
          display: "inline-block",
          ...style,
        }}
      />
    );
  }
  return (
    <span
      style={{
        minWidth: 14, height: 14,
        borderRadius: 7,
        background: tokens.crimson,
        color: tokens.textPrimary,
        fontSize: 9,
        fontWeight: 700,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        paddingInline: 4,
        ...style,
      }}
    >
      {count > 99 ? "99+" : count}
    </span>
  );
}

// ===== Timer pill =====
function TimerPill({ label, time, urgent }) {
  const c = urgent ? tokens.crimson : tokens.textSecondary;
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 4,
        fontSize: 11,
        color: c,
        fontWeight: 600,
      }}
    >
      <span>⏳</span>
      {label && <span>{label}</span>}
      <span className="tw-num" style={{ color: c }}>{time}</span>
    </span>
  );
}

// ===== Tab bar =====
function TabBar({ active = "home", redDots = {} }) {
  const tabs = [
    { id: "home", key: "tab.home", glyph: "⌂" },
    { id: "floor", key: "tab.floor", glyph: "▤" },
    { id: "equipment", key: "tab.equipment", glyph: "⚒" },
    { id: "reports", key: "tab.reports", glyph: "📜" },
  ];
  return (
    <div
      style={{
        flex: "0 0 auto",
        background: tokens.surface,
        borderTop: `1px solid ${tokens.borderSubtle}`,
        display: "grid",
        gridTemplateColumns: "repeat(4, 1fr)",
        paddingBottom: 8,
      }}
    >
      {tabs.map((tab) => {
        const isActive = tab.id === active;
        const hasDot = redDots[tab.id];
        return (
          <button
            key={tab.id}
            style={{
              background: "transparent",
              border: "none",
              paddingBlock: 8,
              cursor: "pointer",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 2,
              fontFamily: tokens.fontUI,
              color: isActive ? tokens.gold : tokens.textMuted,
              position: "relative",
            }}
          >
            <span style={{ fontSize: 18, lineHeight: 1, position: "relative" }}>
              {tab.glyph}
              {hasDot && (
                <RedDot dotOnly style={{ position: "absolute", top: -2, right: -6 }} />
              )}
            </span>
            <span style={{ fontSize: 10, fontWeight: 600 }}>{T(tab.key)}</span>
          </button>
        );
      })}
    </div>
  );
}

// ===== Player chip / header =====
function PlayerChip({ player }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        paddingInline: 14,
        paddingBlock: 10,
      }}
    >
      <div
        style={{
          width: 36, height: 36, borderRadius: 8,
          background: `linear-gradient(135deg, ${tokens.purple}, ${tokens.crimson})`,
          border: `1px solid ${tokens.borderStrong}`,
          display: "grid", placeItems: "center",
          fontFamily: tokens.fontDisplay,
          fontSize: 16, fontWeight: 700,
          color: tokens.textPrimary,
          flex: "0 0 auto",
        }}
      >
        V
      </div>
      <div style={{ flex: "1 1 auto", minWidth: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: tokens.textPrimary }}>
          {player.name}
        </div>
        <div style={{ fontSize: 10, color: tokens.textMuted, marginTop: 1 }}>
          Lv {player.level} · {T("home.combatPower")} <span className="tw-num" style={{ color: tokens.gold }}>{player.cp.toLocaleString()}</span>
        </div>
      </div>
      <div style={{ display: "flex", gap: 6, flex: "0 0 auto", alignItems: "center" }}>
        <RewardChip type="gold" amount={player.currencies.gold.toLocaleString()} />
        <RewardChip type="fragments" amount={player.currencies.fragments} />
      </div>
    </div>
  );
}

// ===== Section heading =====
function SectionHead({ title, right }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        paddingInline: 14,
        marginTop: 14,
        marginBottom: 6,
      }}
    >
      <div
        style={{
          fontSize: 10,
          fontWeight: 700,
          letterSpacing: 1.5,
          textTransform: "uppercase",
          color: tokens.textMuted,
        }}
      >
        {title}
      </div>
      {right}
    </div>
  );
}

// ===== Win chance bucket =====
function winChanceBucket(playerCP, recCP) {
  const r = playerCP / recCP;
  if (r >= 1.15) return "high";
  if (r >= 0.9) return "fair";
  return "low";
}

function WinChancePill({ bucket }) {
  const c =
    bucket === "high" ? tokens.teal :
    bucket === "fair" ? tokens.gold : tokens.crimson;
  return (
    <span
      style={{
        background: c + "1c",
        color: c,
        borderRadius: 4,
        paddingInline: 8,
        paddingBlock: 3,
        fontSize: 11,
        fontWeight: 700,
        letterSpacing: 0.3,
        textTransform: "uppercase",
      }}
    >
      {T(`winChance.${bucket}`)}
    </span>
  );
}

Object.assign(window, {
  TowerUI: {
    tokens,
    PhoneFrame,
    StateBanner,
    Btn,
    RewardChip,
    RewardList,
    NodeStateBadge,
    NodeTypeBadge,
    RedDot,
    TimerPill,
    TabBar,
    PlayerChip,
    SectionHead,
    winChanceBucket,
    WinChancePill,
  },
});
