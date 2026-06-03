// Additional reusable atoms for the MVP screens (Battle Result, Garrison,
// Battle Resolve, Equipment, Reports, Settings). Extends window.TowerUI in
// place so the approved component library (components.jsx) is untouched.

const T = window.TowerI18n.t;
const { tokens, Btn, RewardChip, RewardList, NodeStateBadge, NodeTypeBadge, TimerPill, RedDot } = window.TowerUI;

// ---- one-time keyframes for the new screens ----
if (typeof document !== "undefined" && !document.getElementById("tw2-anim")) {
  const s = document.createElement("style");
  s.id = "tw2-anim";
  s.textContent = `
    @keyframes tw-rise { 0% { opacity:0; transform: translateY(8px) } 100% { opacity:1; transform:none } }
    @keyframes tw-pop  { 0% { opacity:0; transform: scale(.8) } 60% { transform: scale(1.06) } 100% { opacity:1; transform: scale(1) } }
    @keyframes tw-hpdrop { from { width: var(--from) } to { width: var(--to) } }
    @keyframes tw-sheen { 0%{transform:translateX(-120%)} 100%{transform:translateX(220%)} }
  `;
  document.head.appendChild(s);
}

// ===== Pushed-screen header (back chevron + title + optional right slot) =====
function PushHeader({ title, onBack, right, accent }) {
  return (
    <div
      style={{
        flex: "0 0 auto",
        paddingInline: 12,
        paddingBlock: 10,
        display: "flex",
        alignItems: "center",
        gap: 8,
        borderBottom: `1px solid ${tokens.borderSubtle}`,
        background: tokens.surface,
      }}
    >
      <button
        onClick={onBack}
        style={{
          width: 32, height: 32, borderRadius: 8, flex: "0 0 auto",
          background: tokens.inset, border: `1px solid ${tokens.borderSubtle}`,
          color: tokens.textSecondary, fontSize: 15, cursor: "pointer",
          display: "grid", placeItems: "center",
        }}
      >
        ◀
      </button>
      <div
        className="tw-display"
        style={{ flex: "1 1 auto", minWidth: 0, fontSize: 17, fontWeight: 700, color: accent || tokens.textPrimary, lineHeight: 1.1 }}
      >
        {title}
      </div>
      {right}
    </div>
  );
}

// ===== Section card wrapper (the recurring inset panel) =====
function Panel({ children, style, accent }) {
  return (
    <div
      style={{
        marginInline: 14,
        background: tokens.surface,
        border: `1px solid ${accent || tokens.borderSubtle}`,
        borderRadius: 12,
        overflow: "hidden",
        ...style,
      }}
    >
      {children}
    </div>
  );
}

// ===== Labeled section header reused inside scroll views =====
function MiniHead({ title, right, style }) {
  return (
    <div
      style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        paddingInline: 14, marginTop: 14, marginBottom: 6, ...style,
      }}
    >
      <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", color: tokens.textMuted }}>
        {title}
      </div>
      {right}
    </div>
  );
}

// ===== Progress bar (reward cap) =====
function ProgressBar({ pct, urgent, full, height = 6 }) {
  const c = full ? tokens.gold : urgent ? tokens.crimson : tokens.purple;
  return (
    <div style={{ width: "100%", height, borderRadius: height / 2, background: tokens.inset, overflow: "hidden", position: "relative" }}>
      <div
        style={{
          width: `${Math.min(100, pct)}%`, height: "100%", borderRadius: height / 2,
          background: full
            ? `linear-gradient(90deg, ${tokens.goldDim}, ${tokens.gold})`
            : `linear-gradient(90deg, ${c}99, ${c})`,
          transition: "width .4s ease",
        }}
      />
      {full && (
        <div style={{
          position: "absolute", inset: 0, overflow: "hidden",
        }}>
          <div style={{
            position: "absolute", top: 0, bottom: 0, width: "40%",
            background: "linear-gradient(90deg, transparent, rgba(255,255,255,.35), transparent)",
            animation: "tw-sheen 2.4s linear infinite",
          }} />
        </div>
      )}
    </div>
  );
}

// ===== HP / combat status bar (battle resolve) =====
function HPBar({ pct, side, height = 9 }) {
  const c = side === "enemy" ? tokens.crimson : tokens.teal;
  return (
    <div style={{ width: "100%", height, borderRadius: height / 2, background: tokens.inset, overflow: "hidden", border: `1px solid ${tokens.borderSubtle}` }}>
      <div
        style={{
          height: "100%",
          width: `${Math.max(0, Math.min(100, pct))}%`,
          background: `linear-gradient(90deg, ${c}, ${c}cc)`,
          borderRadius: height / 2,
          transition: "width .5s cubic-bezier(.3,.8,.4,1)",
          marginLeft: side === "enemy" ? "auto" : 0,
        }}
      />
    </div>
  );
}

// ===== Toggle switch =====
function Toggle({ on, onChange, disabled }) {
  return (
    <button
      onClick={() => !disabled && onChange && onChange(!on)}
      disabled={disabled}
      aria-pressed={on}
      style={{
        width: 44, height: 26, borderRadius: 13, flex: "0 0 auto",
        border: `1px solid ${on ? tokens.goldDim : tokens.borderSubtle}`,
        background: on ? tokens.gold : tokens.inset,
        position: "relative", cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.5 : 1, transition: "background .15s, border-color .15s", padding: 0,
      }}
    >
      <span
        style={{
          position: "absolute", top: 2, left: on ? 20 : 2,
          width: 20, height: 20, borderRadius: "50%",
          background: on ? "#1a1206" : tokens.textSecondary,
          transition: "left .16s cubic-bezier(.3,.8,.4,1)",
        }}
      />
    </button>
  );
}

// ===== Segmented control (battle speed, language, filters) =====
function Segmented({ options, value, onChange, locale }) {
  return (
    <div
      style={{
        display: "flex", gap: 2, padding: 2,
        background: tokens.inset, borderRadius: 9, border: `1px solid ${tokens.borderSubtle}`,
      }}
    >
      {options.map((opt) => {
        const active = opt.value === value;
        return (
          <button
            key={opt.value}
            onClick={() => onChange && onChange(opt.value)}
            style={{
              flex: "1 1 0", minWidth: 0, minHeight: 32, paddingInline: 10,
              border: "none", borderRadius: 7, cursor: "pointer",
              background: active ? tokens.gold : "transparent",
              color: active ? "#1a1206" : tokens.textSecondary,
              fontFamily: tokens.fontUI, fontSize: 12, fontWeight: 700,
              letterSpacing: 0.2, whiteSpace: "nowrap",
              boxShadow: active ? `0 1px 0 ${tokens.goldDim}` : "none",
              transition: "background .12s",
            }}
          >
            {opt.labelKey ? T(opt.labelKey, opt.vars, locale) : opt.label}
          </button>
        );
      })}
    </div>
  );
}

// ===== Generic list row (reports, settings) =====
function ListRow({ icon, iconColor, iconBg, title, subtitle, right, onClick, unread, danger, style }) {
  return (
    <button
      onClick={onClick}
      style={{
        width: "100%", textAlign: "left",
        display: "flex", alignItems: "center", gap: 10,
        paddingInline: 12, paddingBlock: 11, minHeight: 44,
        background: "transparent", border: "none",
        borderBottom: `1px solid ${tokens.borderSubtle}`,
        cursor: onClick ? "pointer" : "default",
        fontFamily: tokens.fontUI, position: "relative",
        ...style,
      }}
    >
      {icon !== undefined && (
        <span style={{
          flex: "0 0 auto", width: 34, height: 34, borderRadius: 9,
          background: iconBg || tokens.inset, color: iconColor || tokens.textSecondary,
          display: "grid", placeItems: "center", fontSize: 16,
        }}>
          {icon}
        </span>
      )}
      <span style={{ flex: "1 1 auto", minWidth: 0 }}>
        <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: danger ? tokens.crimson : tokens.textPrimary }}>{title}</span>
          {unread && <RedDot dotOnly />}
        </span>
        {subtitle && <span style={{ display: "block", fontSize: 11, color: tokens.textMuted, marginTop: 2, lineHeight: 1.3 }}>{subtitle}</span>}
      </span>
      {right && <span style={{ flex: "0 0 auto", display: "flex", alignItems: "center", gap: 8 }}>{right}</span>}
    </button>
  );
}

// ===== Empty state =====
function EmptyState({ glyph, title, body, action }) {
  return (
    <div style={{ padding: "40px 28px", textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
      <div style={{
        width: 56, height: 56, borderRadius: 14, background: tokens.inset,
        border: `1px solid ${tokens.borderSubtle}`, display: "grid", placeItems: "center",
        fontSize: 26, color: tokens.textMuted, marginBottom: 4,
      }}>
        {glyph}
      </div>
      <div className="tw-display" style={{ fontSize: 16, fontWeight: 700, color: tokens.textSecondary }}>{title}</div>
      {body && <div style={{ fontSize: 12, color: tokens.textMuted, lineHeight: 1.5, maxWidth: 220 }}>{body}</div>}
      {action && <div style={{ marginTop: 8 }}>{action}</div>}
    </div>
  );
}

// ===== Gear slot icon (monochrome stroke SVG, tinted by rarity) =====
const SLOT_PATHS = {
  weapon: "M14.5 3.5 L20 9 L10.5 18.5 L8 16 L17.5 6.5 Z M8 16 L5 19 M5 19 L4 20 M5 19 L9 20",
  helmet: "M5 13 a7 7 0 0 1 14 0 v3 h-3 v-2 h-2 v2 h-2 v-2 h-2 v2 H5 Z",
  armor:  "M8 4 L12 6 L16 4 L19 7 L17 9 V19 H7 V9 L5 7 Z",
  ring:   "M12 9 a5 5 0 1 0 0.01 0 Z M12 9 L10.5 5 H13.5 Z",
  necklace: "M5 5 a10 8 0 0 0 14 0 M12 13 a2.4 2.4 0 1 0 0.01 0 Z",
  boots:  "M8 4 V14 H14 a3 3 0 0 1 3 3 v2 H6 V4 Z",
};
function GearIcon({ slot, color, size = 20 }) {
  const d = SLOT_PATHS[slot] || SLOT_PATHS.weapon;
  const isFill = slot === "armor" || slot === "boots" || slot === "helmet";
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={{ display: "block" }}>
      <path
        d={d}
        stroke={color}
        strokeWidth={slot === "ring" || slot === "necklace" ? 1.6 : 1.8}
        strokeLinejoin="round"
        strokeLinecap="round"
        fill={isFill ? color + "22" : "none"}
      />
    </svg>
  );
}

const SLOT_ORDER = ["weapon", "helmet", "armor", "ring", "necklace", "boots"];

// ===== Rarity gem dot =====
function RarityDot({ rarity, size = 7 }) {
  return <span style={{ width: size, height: size, borderRadius: "50%", background: tokens.rarity[rarity], display: "inline-block", boxShadow: `0 0 6px ${tokens.rarity[rarity]}88` }} />;
}

// ===== Gear card (equipment list / backpack / drop) =====
// gear: { slot, nameKey, rarity, cp, stats:[{k,v}], level, isNew, equipped }
function GearCard({ gear, selected, compact, onClick, footer, locale }) {
  const rc = tokens.rarity[gear.rarity];
  return (
    <div
      onClick={onClick}
      style={{
        cursor: onClick ? "pointer" : "default",
        background: `linear-gradient(180deg, ${rc}1f, transparent 55%), ${tokens.surfaceRaised}`,
        border: `1px solid ${selected ? rc : rc + "66"}`,
        boxShadow: selected ? `0 0 0 1px ${rc}, 0 0 16px ${rc}33` : "none",
        borderRadius: 12, padding: compact ? 9 : 11,
        display: "flex", gap: 10, alignItems: "center", position: "relative",
      }}
    >
      {/* rarity icon tile */}
      <div style={{
        flex: "0 0 auto", width: compact ? 40 : 46, height: compact ? 40 : 46, borderRadius: 10,
        background: tokens.inset, border: `1px solid ${rc}`,
        display: "grid", placeItems: "center", position: "relative",
      }}>
        <GearIcon slot={gear.slot} color={rc} size={compact ? 20 : 24} />
        {gear.isNew && (
          <span style={{
            position: "absolute", top: -6, right: -6,
            background: tokens.crimson, color: tokens.textPrimary,
            fontSize: 8, fontWeight: 800, letterSpacing: 0.5,
            paddingInline: 4, paddingBlock: 1, borderRadius: 4, textTransform: "uppercase",
          }}>{T("equip.new", null, locale)}</span>
        )}
      </div>
      {/* name + stats */}
      <div style={{ flex: "1 1 auto", minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
          <RarityDot rarity={gear.rarity} />
          <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: 0.5, textTransform: "uppercase", color: rc }}>
            {T(`rarity.${gear.rarity}`, null, locale)}
          </span>
          <span style={{ fontSize: 9, color: tokens.textMuted }}>· {T(`slot.${gear.slot}`, null, locale)}</span>
        </div>
        <div className="tw-display" style={{ fontSize: compact ? 13 : 14, fontWeight: 700, color: tokens.textPrimary, lineHeight: 1.15, marginTop: 2 }}>
          {T(gear.nameKey, null, locale)}
        </div>
        {gear.stats && !compact && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 4 }}>
            {gear.stats.map((s, i) => (
              <span key={i} style={{ fontSize: 10, color: tokens.textMuted }}>
                {T(`stat.${s.k}`, null, locale)} <span className="tw-num" style={{ color: tokens.textSecondary }}>{s.v}</span>
              </span>
            ))}
          </div>
        )}
      </div>
      {/* CP */}
      <div style={{ flex: "0 0 auto", textAlign: "right" }}>
        <div className="tw-num" style={{ fontSize: compact ? 13 : 15, fontWeight: 700, color: rc }}>+{gear.cp}</div>
        <div style={{ fontSize: 8, color: tokens.textMuted, letterSpacing: 0.5 }}>CP</div>
      </div>
      {footer}
    </div>
  );
}

// ===== Versus avatar (battle result / resolve) =====
function CombatantAvatar({ name, kind, size = 56, cp }) {
  // kind: "me" | "npc" | "player"
  const grad =
    kind === "me" ? `linear-gradient(135deg, ${tokens.purple}, ${tokens.crimson})` :
    kind === "npc" ? `linear-gradient(135deg, ${tokens.npc}, ${tokens.inset})` :
    `linear-gradient(135deg, ${tokens.crimson}, ${tokens.purpleDim})`;
  const ring = kind === "me" ? tokens.gold : kind === "npc" ? tokens.npc : tokens.crimson;
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6, flex: "1 1 0", minWidth: 0 }}>
      <div style={{
        width: size, height: size, borderRadius: 14, background: grad,
        border: `2px solid ${ring}`, display: "grid", placeItems: "center",
        fontFamily: tokens.fontDisplay, fontWeight: 700, fontSize: size * 0.4, color: tokens.textPrimary,
        boxShadow: `0 0 14px ${ring}44`,
      }}>
        {kind === "npc" ? "⚔" : (name ? name[0] : "?")}
      </div>
      <div style={{ fontSize: 12, fontWeight: 700, color: tokens.textPrimary, maxWidth: "100%", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{name}</div>
      {cp !== undefined && (
        <div style={{ fontSize: 10, color: tokens.textMuted }}>
          <span style={{ letterSpacing: 0.5 }}>CP </span>
          <span className="tw-num" style={{ color: ring }}>{cp.toLocaleString()}</span>
        </div>
      )}
    </div>
  );
}

Object.assign(window.TowerUI, {
  PushHeader, Panel, MiniHead, ProgressBar, HPBar, Toggle, Segmented,
  ListRow, EmptyState, GearIcon, GearCard, RarityDot, CombatantAvatar,
  SLOT_ORDER,
});
