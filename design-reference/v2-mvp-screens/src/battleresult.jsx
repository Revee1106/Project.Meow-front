// Battle Result — pushed flow shown after a challenge resolves.
// Variants: victory vs NPC, victory vs player (upset), defeat.
// Handles node-unlocked banner, rewards / no-rewards, gear-drop / no-drop.

const T = window.TowerI18n.t;
const {
  tokens, Btn, RewardList, PushHeader, GearCard, CombatantAvatar,
  NodeTypeBadge,
} = window.TowerUI;

function StatCell({ label, value, color }) {
  return (
    <div style={{ flex: "1 1 0", minWidth: 0, textAlign: "center", paddingBlock: 8 }}>
      <div className="tw-num" style={{ fontSize: 16, fontWeight: 700, color: color || tokens.textPrimary }}>{value}</div>
      <div style={{ fontSize: 9, color: tokens.textMuted, marginTop: 2, letterSpacing: 0.3 }}>{label}</div>
    </div>
  );
}

function BattleResultScreen({ data, locale, onBack }) {
  const win = data.outcome === "victory";
  const accent = win ? tokens.gold : tokens.crimson;
  const enemyName = data.opponentKind === "npc" ? T(data.enemyNameKey, null, locale) : data.enemyName;
  const subtitleKey = win ? (data.opponentKind === "npc" ? "result.subtitle.npc" : "result.subtitle.player") : "result.subtitle.defeat";

  // gear-drop comparison vs currently equipped weapon (188 CP)
  const drop = data.drop;
  const dropDelta = drop ? drop.cp - 188 : 0;

  return (
    <>
      <PushHeader title={T(win ? "result.victory" : "result.defeat", null, locale)} onBack={onBack} accent={accent} />

      <div className="tw-scroll" style={{ flex: "1 1 auto", overflowY: "auto", paddingBottom: 12 }}>
        {/* hero */}
        <div
          style={{
            position: "relative", overflow: "hidden",
            paddingTop: 22, paddingBottom: 18, paddingInline: 16, textAlign: "center",
            background: `radial-gradient(120% 90% at 50% 0%, ${accent}26, transparent 70%)`,
            borderBottom: `1px solid ${tokens.borderSubtle}`,
          }}
        >
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            color: accent, fontSize: 13, letterSpacing: 3, fontWeight: 700, textTransform: "uppercase",
          }}>
            <span>{win ? "✦" : "✗"}</span>
            <span>{T(win ? "result.victory" : "result.defeat", null, locale)}</span>
            <span>{win ? "✦" : "✗"}</span>
          </div>
          <div
            className="tw-display"
            style={{ fontSize: 26, fontWeight: 700, color: tokens.textPrimary, lineHeight: 1.1, marginTop: 8, animation: "tw-pop .4s ease both" }}
          >
            {T(subtitleKey, { name: enemyName }, locale)}
          </div>

          {data.upset && (
            <div style={{
              display: "inline-block", marginTop: 10,
              background: tokens.teal + "1f", color: tokens.teal,
              border: `1px solid ${tokens.tealDim}`, borderRadius: 6,
              fontSize: 11, fontWeight: 700, paddingInline: 8, paddingBlock: 3,
            }}>
              ★ {T("result.upset", null, locale)}
            </div>
          )}

          {/* versus */}
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 18 }}>
            <CombatantAvatar name={T("result.you", null, locale)} kind="me" cp={data.myCP} />
            <div style={{ flex: "0 0 auto", display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
              <span className="tw-display" style={{ fontSize: 14, fontWeight: 700, color: tokens.textMuted }}>VS</span>
              <span className="tw-num" style={{
                fontSize: 11, fontWeight: 700,
                color: data.myCP >= data.enemyCP ? tokens.teal : tokens.crimson,
              }}>
                {data.myCP >= data.enemyCP ? "+" : ""}{(data.myCP - data.enemyCP).toLocaleString()}
              </span>
            </div>
            <CombatantAvatar name={enemyName} kind={data.opponentKind} cp={data.enemyCP} />
          </div>
        </div>

        {/* node unlocked banner */}
        {data.nodeUnlocked && win && (
          <div style={{
            marginInline: 14, marginTop: 12,
            background: tokens.teal + "12", border: `1px solid ${tokens.tealDim}`,
            borderLeft: `3px solid ${tokens.teal}`, borderRadius: 8, padding: 10,
            display: "flex", alignItems: "center", gap: 8,
          }}>
            <span style={{ color: tokens.teal, fontSize: 15 }}>⛨</span>
            <span style={{ fontSize: 12, color: tokens.textPrimary, fontWeight: 600, lineHeight: 1.35 }}>
              {T("result.nodeUnlocked", null, locale)}
            </span>
          </div>
        )}

        {/* battle summary */}
        <div style={{
          marginInline: 14, marginTop: 12,
          background: tokens.surface, border: `1px solid ${tokens.borderSubtle}`, borderRadius: 12, overflow: "hidden",
        }}>
          <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", color: tokens.textMuted, paddingInline: 12, paddingTop: 10 }}>
            {T("result.summary", null, locale)}
          </div>
          <div style={{ display: "flex", paddingInline: 6, paddingBottom: 4, marginTop: 2 }}>
            <StatCell label={T("result.rounds", null, locale)} value={data.stats.rounds} />
            <StatCell label={T("result.dmgDealt", null, locale)} value={data.stats.dmgDealt.toLocaleString()} color={tokens.teal} />
            <StatCell label={T("result.dmgTaken", null, locale)} value={data.stats.dmgTaken.toLocaleString()} color={tokens.crimson} />
            <StatCell label={T("result.hpLeft", null, locale)} value={`${data.stats.hpLeft}%`} color={data.stats.hpLeft > 0 ? tokens.gold : tokens.crimson} />
          </div>
        </div>

        {/* rewards */}
        <div style={{ marginInline: 14, marginTop: 12 }}>
          <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", color: tokens.textMuted, marginBottom: 6 }}>
            {T("result.rewards", null, locale)}
          </div>
          {data.rewards.length > 0 ? (
            <div style={{ background: tokens.inset, borderRadius: 10, padding: 10 }}>
              <RewardList rewards={data.rewards} />
            </div>
          ) : (
            <div style={{ fontSize: 12, color: tokens.textMuted, background: tokens.inset, borderRadius: 10, padding: 12, textAlign: "center" }}>
              {T("result.noRewards", null, locale)}
            </div>
          )}
        </div>

        {/* gear drop */}
        <div style={{ marginInline: 14, marginTop: 12 }}>
          <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", color: tokens.textMuted, marginBottom: 6 }}>
            {drop ? T("result.gearDrop", null, locale) : ""}
          </div>
          {drop ? (
            <div style={{ animation: "tw-rise .4s ease both" }}>
              <GearCard gear={drop} locale={locale} />
              <div style={{
                marginTop: 6, display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                fontSize: 11, fontWeight: 700,
                color: dropDelta > 0 ? tokens.teal : tokens.textMuted,
              }}>
                <span>{dropDelta > 0 ? "▲" : "▼"}</span>
                <span>{dropDelta > 0 ? T("result.betterBy", { n: dropDelta }, locale) : T("result.notBetter", null, locale)}</span>
              </div>
            </div>
          ) : win ? (
            <div style={{ fontSize: 12, color: tokens.textMuted, background: tokens.inset, borderRadius: 10, padding: 12, textAlign: "center" }}>
              {T("result.noGearDrop", null, locale)}
            </div>
          ) : null}
        </div>
      </div>

      {/* sticky action footer */}
      <div style={{
        flex: "0 0 auto", paddingInline: 14, paddingTop: 10, paddingBottom: 16,
        background: tokens.surface, borderTop: `1px solid ${tokens.borderSubtle}`,
        display: "flex", flexDirection: "column", gap: 8,
      }}>
        {win ? (
          <>
            {drop && dropDelta > 0 && (
              <Btn variant="primary" fullWidth>⚒ {T("result.action.equip", null, locale)}</Btn>
            )}
            {data.canOccupy ? (
              <Btn variant={drop && dropDelta > 0 ? "ghost" : "primary"} fullWidth>⛨ {T("result.action.occupy", null, locale)}</Btn>
            ) : null}
            <Btn variant="secondary" fullWidth onClick={onBack}>{T("result.action.return", null, locale)}</Btn>
          </>
        ) : (
          <>
            <Btn variant="primary" fullWidth>⚔ {T("result.action.retry", null, locale)}</Btn>
            <Btn variant="secondary" fullWidth onClick={onBack}>{T("result.action.return", null, locale)}</Btn>
          </>
        )}
      </div>
    </>
  );
}

window.BattleResultScreen = BattleResultScreen;
