// Equipment — bottom-tab screen. Equipped slots, backpack, compare & equip,
// auto-equip, empty-backpack state. (No enhancement / gems / sets in MVP.)

const T = window.TowerI18n.t;
const {
  tokens, Btn, TabBar, GearCard, GearIcon, RarityDot, SLOT_ORDER, EmptyState,
} = window.TowerUI;
const { useState } = React;

function EquipHeader({ cp, locale, onSettings }) {
  return (
    <div style={{
      flex: "0 0 auto", paddingInline: 14, paddingTop: 10, paddingBottom: 12,
      borderBottom: `1px solid ${tokens.borderSubtle}`,
      display: "flex", alignItems: "center", justifyContent: "space-between",
    }}>
      <div>
        <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", color: tokens.textMuted }}>
          {T("equip.totalCP", null, locale)}
        </div>
        <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginTop: 2 }}>
          <span style={{ color: tokens.gold, fontSize: 18 }}>⚔</span>
          <span className="tw-num tw-display" style={{ fontSize: 26, fontWeight: 700, color: tokens.textPrimary }}>{cp.toLocaleString()}</span>
        </div>
      </div>
      <button onClick={onSettings} style={{
        width: 36, height: 36, borderRadius: 9, background: tokens.inset,
        border: `1px solid ${tokens.borderSubtle}`, color: tokens.textSecondary,
        fontSize: 17, cursor: "pointer", display: "grid", placeItems: "center",
      }}>⚙</button>
    </div>
  );
}

// compact equipped-slot tile
function SlotTile({ slot, gear, locale, onClick, selected }) {
  const rc = gear ? tokens.rarity[gear.rarity] : tokens.borderSubtle;
  return (
    <button onClick={onClick} style={{
      textAlign: "left", cursor: "pointer", fontFamily: tokens.fontUI,
      background: gear ? `linear-gradient(180deg, ${rc}18, transparent 60%), ${tokens.surface}` : tokens.surface,
      border: `1px solid ${selected ? tokens.gold : gear ? rc + "66" : tokens.borderSubtle}`,
      boxShadow: selected ? `0 0 0 1px ${tokens.gold}` : "none",
      borderRadius: 10, padding: 9, display: "flex", gap: 8, alignItems: "center", minWidth: 0,
    }}>
      <span style={{
        flex: "0 0 auto", width: 36, height: 36, borderRadius: 8, background: tokens.inset,
        border: `1px solid ${rc}`, display: "grid", placeItems: "center",
      }}>
        <GearIcon slot={slot} color={rc} size={19} />
      </span>
      <span style={{ flex: "1 1 auto", minWidth: 0 }}>
        <span style={{ display: "block", fontSize: 9, color: tokens.textMuted, letterSpacing: 0.3 }}>{T(`slot.${slot}`, null, locale)}</span>
        {gear ? (
          <>
            <span className="tw-display" style={{ display: "block", fontSize: 12, fontWeight: 700, color: tokens.textPrimary, lineHeight: 1.15, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              {T(gear.nameKey, null, locale)}
            </span>
            <span className="tw-num" style={{ fontSize: 10, color: rc, fontWeight: 700 }}>+{gear.cp} CP</span>
          </>
        ) : (
          <span style={{ display: "block", fontSize: 12, color: tokens.textMuted, marginTop: 2 }}>{T("equip.slotEmpty", null, locale)}</span>
        )}
      </span>
    </button>
  );
}

// comparison bottom sheet: equipped vs candidate
function CompareSheet({ candidate, equipped, locale, onClose }) {
  const delta = candidate.cp - (equipped ? equipped.cp : 0);
  const rc = tokens.rarity[candidate.rarity];
  // merge stat keys for a delta table
  const keys = ["atk", "def", "hp", "crit", "spd"];
  const eqMap = {}; (equipped?.stats || []).forEach(s => eqMap[s.k] = s.v);
  const newMap = {}; (candidate.stats || []).forEach(s => newMap[s.k] = s.v);
  const rows = keys.filter(k => eqMap[k] !== undefined || newMap[k] !== undefined);

  return (
    <>
      <div onClick={onClose} style={{ position: "absolute", inset: 0, background: "rgba(7,5,9,.72)", zIndex: 8 }} />
      <div style={{
        position: "absolute", left: 0, right: 0, bottom: 0, zIndex: 9,
        background: tokens.surfaceRaised, borderTopLeftRadius: 18, borderTopRightRadius: 18,
        borderTop: `1px solid ${tokens.borderStrong}`, boxShadow: "0 -8px 32px rgba(0,0,0,.5)",
        paddingInline: 16, paddingTop: 10, paddingBottom: 18,
      }}>
        <div style={{ display: "flex", justifyContent: "center", paddingTop: 0, marginBottom: 10 }}>
          <span style={{ width: 36, height: 4, borderRadius: 2, background: tokens.borderStrong }} />
        </div>
        <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", color: tokens.textMuted, marginBottom: 8 }}>
          {T("equip.comparing", null, locale)} · {T(`slot.${candidate.slot}`, null, locale)}
        </div>

        <GearCard gear={candidate} locale={locale} />

        {/* delta table */}
        <div style={{ marginTop: 10, background: tokens.inset, borderRadius: 10, paddingInline: 10, paddingBlock: 4 }}>
          <div style={{ display: "flex", fontSize: 9, color: tokens.textMuted, letterSpacing: 0.3, paddingBlock: 6, borderBottom: `1px solid ${tokens.borderSubtle}` }}>
            <span style={{ flex: "1 1 auto" }}>{T("equip.replaces", { name: equipped ? T(equipped.nameKey, null, locale) : "—" }, locale)}</span>
          </div>
          {rows.map((k) => {
            const ev = eqMap[k], nv = newMap[k];
            const en = typeof ev === "string" ? parseFloat(ev) : (ev || 0);
            const nn = typeof nv === "string" ? parseFloat(nv) : (nv || 0);
            const up = nn > en, down = nn < en;
            return (
              <div key={k} style={{ display: "flex", alignItems: "center", paddingBlock: 6, borderBottom: `1px solid ${tokens.borderSubtle}` }}>
                <span style={{ flex: "1 1 auto", fontSize: 11, color: tokens.textSecondary }}>{T(`stat.${k}`, null, locale)}</span>
                <span className="tw-num" style={{ width: 54, textAlign: "right", fontSize: 11, color: tokens.textMuted }}>{ev ?? "—"}</span>
                <span style={{ width: 20, textAlign: "center", color: up ? tokens.teal : down ? tokens.crimson : tokens.textMuted, fontSize: 11 }}>→</span>
                <span className="tw-num" style={{ width: 54, textAlign: "right", fontSize: 11, fontWeight: 700, color: up ? tokens.teal : down ? tokens.crimson : tokens.textPrimary }}>{nv ?? "—"}</span>
              </div>
            );
          })}
          <div style={{ display: "flex", alignItems: "center", paddingBlock: 8 }}>
            <span style={{ flex: "1 1 auto", fontSize: 12, fontWeight: 700, color: tokens.textPrimary }}>{T("equip.cpDelta", null, locale)}</span>
            <span className="tw-num" style={{ fontSize: 15, fontWeight: 700, color: delta > 0 ? tokens.teal : delta < 0 ? tokens.crimson : tokens.textMuted }}>
              {delta > 0 ? "+" : ""}{delta}
            </span>
          </div>
        </div>

        <div style={{ marginTop: 14, display: "flex", flexDirection: "column", gap: 8 }}>
          <Btn variant="primary" fullWidth>⚒ {T("equip.equip", null, locale)}</Btn>
          <Btn variant="secondary" fullWidth onClick={onClose}>{T("common.cancel", null, locale)}</Btn>
        </div>
      </div>
    </>
  );
}

function EquipmentScreen({ empty, locale, onSettings }) {
  const equipped = window.TowerData.Equipped;
  const backpack = empty ? [] : window.TowerData.Backpack;
  const player = window.TowerData.Player;
  const [sel, setSel] = useState(null);

  return (
    <>
      <EquipHeader cp={player.cp} locale={locale} onSettings={onSettings} />

      <div className="tw-scroll" style={{ flex: "1 1 auto", overflowY: "auto", paddingBottom: 14 }}>
        {/* equipped grid */}
        <div style={{ paddingInline: 14, marginTop: 12, fontSize: 10, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", color: tokens.textMuted }}>
          {T("equip.equipped", null, locale)}
        </div>
        <div style={{ marginInline: 14, marginTop: 8, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
          {SLOT_ORDER.map((slot) => (
            <SlotTile key={slot} slot={slot} gear={equipped[slot]} locale={locale} onClick={() => {}} />
          ))}
        </div>

        {/* auto-equip */}
        <div style={{ marginInline: 14, marginTop: 12 }}>
          <Btn variant="ghost" fullWidth>✦ {T("equip.autoEquip", null, locale)}</Btn>
        </div>

        {/* backpack */}
        <div style={{ paddingInline: 14, marginTop: 16, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", color: tokens.textMuted }}>
            {T("equip.backpack", null, locale)}
          </span>
          {!empty && <span style={{ fontSize: 10, color: tokens.textMuted }}>{backpack.length}</span>}
        </div>

        {empty ? (
          <EmptyState glyph="⚒" title={T("equip.emptyBackpack.title", null, locale)} body={T("equip.emptyBackpack.body", null, locale)} />
        ) : (
          <>
            <div style={{ paddingInline: 14, marginTop: 2, fontSize: 10, color: tokens.textMuted }}>{T("equip.tapHint", null, locale)}</div>
            <div style={{ marginInline: 14, marginTop: 8, display: "flex", flexDirection: "column", gap: 8 }}>
              {backpack.map((g) => {
                const eq = equipped[g.slot];
                const better = eq && g.cp > eq.cp;
                return (
                  <GearCard
                    key={g.id} gear={g} locale={locale} selected={sel === g.id}
                    onClick={() => setSel(g.id)}
                    footer={
                      <span style={{
                        position: "absolute", top: 8, right: 10, fontSize: 9, fontWeight: 700,
                        color: better ? tokens.teal : tokens.textMuted,
                      }}>
                        {better ? `▲ +${g.cp - eq.cp}` : ""}
                      </span>
                    }
                  />
                );
              })}
            </div>
          </>
        )}
      </div>

      <TabBar active="equipment" redDots={{ reports: true }} />

      {sel && (
        <CompareSheet
          candidate={backpack.find((b) => b.id === sel)}
          equipped={equipped[backpack.find((b) => b.id === sel).slot]}
          locale={locale}
          onClose={() => setSel(null)}
        />
      )}
    </>
  );
}

window.EquipmentScreen = EquipmentScreen;
