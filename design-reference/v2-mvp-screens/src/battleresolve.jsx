// Battle Resolving / Replay — lightweight theatrical transition after tapping
// Challenge. Server auto-resolves; this is presentation only.
// phase: "resolving" (mid-fight, skip/speed visible) | "complete" (View Result).

const T = window.TowerI18n.t;
const { tokens, Btn, HPBar, Segmented, CombatantAvatar } = window.TowerUI;

function LogFeed({ lines, locale }) {
  return (
    <div className="tw-scroll" style={{
      display: "flex", flexDirection: "column", gap: 6,
      maxHeight: 132, overflowY: "auto",
    }}>
      {lines.map((l, i) => {
        const me = l.side === "me";
        const isCrit = l.key === "resolve.log.crit";
        const isFinish = l.key === "resolve.log.finish";
        const c = isFinish ? tokens.gold : isCrit ? tokens.gold : me ? tokens.teal : tokens.crimson;
        return (
          <div key={i} style={{
            display: "flex", gap: 8, alignItems: "baseline",
            fontSize: 12, lineHeight: 1.35,
            opacity: i === lines.length - 1 ? 1 : 0.62,
            animation: i === lines.length - 1 ? "tw-rise .25s ease both" : "none",
          }}>
            <span style={{ flex: "0 0 auto", color: tokens.textMuted, fontSize: 10, width: 16 }}>{i + 1}</span>
            <span style={{ flex: "0 0 auto", color: c, fontWeight: 700 }}>{me ? "▸" : "◂"}</span>
            <span style={{ color: isFinish ? tokens.gold : tokens.textPrimary, fontWeight: isFinish ? 700 : 400 }}>
              {T(l.key, l.vars, locale)}
            </span>
          </div>
        );
      })}
    </div>
  );
}

function BattleResolveScreen({ data, log, phase = "resolving", visibleLines = 3, myHp = 64, enemyHp = 22, locale, onBack }) {
  const complete = phase === "complete";
  const enemyName = data.opponentKind === "npc" ? T(data.enemyNameKey, null, locale) : data.enemyName;
  const lines = log.slice(0, complete ? log.length : visibleLines);
  const eHp = complete ? 0 : enemyHp;

  return (
    <div style={{
      flex: "1 1 auto", display: "flex", flexDirection: "column", minHeight: 0,
      background: `radial-gradient(120% 70% at 50% 12%, ${tokens.crimson}1a, transparent 60%), ${tokens.bg}`,
    }}>
      {/* top bar: round + skip */}
      <div style={{
        flex: "0 0 auto", paddingInline: 14, paddingTop: 14, paddingBottom: 8,
        display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", color: tokens.textMuted }}>
          {complete ? T("resolve.title", null, locale) : T("resolve.round", { n: visibleLines }, locale)}
        </span>
        {!complete && (
          <button onClick={onBack} style={{
            background: tokens.inset, border: `1px solid ${tokens.borderSubtle}`, color: tokens.textSecondary,
            borderRadius: 7, fontSize: 11, fontWeight: 700, paddingInline: 12, paddingBlock: 6, cursor: "pointer",
            fontFamily: tokens.fontUI, minHeight: 30,
          }}>
            {T("resolve.skip", null, locale)} ⏭
          </button>
        )}
      </div>

      {/* combatants + HP */}
      <div style={{ flex: "0 0 auto", paddingInline: 18, paddingTop: 8 }}>
        {/* me */}
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <CombatantAvatar name={T("result.you", null, locale)} kind="me" cp={data.myCP} size={46} />
          <div style={{ flex: "1 1 auto", minWidth: 0 }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: tokens.textMuted, marginBottom: 4 }}>
              <span>{T("result.you", null, locale)}</span>
              <span className="tw-num" style={{ color: tokens.teal }}>{myHp}%</span>
            </div>
            <HPBar pct={myHp} side="me" />
          </div>
        </div>

        {/* vs divider */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBlock: 12 }}>
          <span style={{ flex: 1, height: 1, background: tokens.borderSubtle }} />
          <span className="tw-display" style={{ fontSize: 13, fontWeight: 700, color: tokens.crimson, letterSpacing: 2 }}>VS</span>
          <span style={{ flex: 1, height: 1, background: tokens.borderSubtle }} />
        </div>

        {/* enemy */}
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ flex: "1 1 auto", minWidth: 0 }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: tokens.textMuted, marginBottom: 4 }}>
              <span className="tw-num" style={{ color: tokens.crimson }}>{eHp}%</span>
              <span>{enemyName}</span>
            </div>
            <HPBar pct={eHp} side="enemy" />
          </div>
          <CombatantAvatar name={enemyName} kind={data.opponentKind} cp={data.enemyCP} size={46} />
        </div>
      </div>

      {/* log feed */}
      <div style={{
        flex: "1 1 auto", minHeight: 0, marginInline: 14, marginTop: 16,
        background: tokens.inset, border: `1px solid ${tokens.borderSubtle}`, borderRadius: 12,
        padding: 12, display: "flex", flexDirection: "column",
      }}>
        <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", color: tokens.textMuted, marginBottom: 8 }}>
          {T("resolve.title", null, locale)} · {T("resolve.round", { n: complete ? log.length : visibleLines }, locale)}
        </div>
        <LogFeed lines={lines} locale={locale} />
      </div>

      {/* footer: resolving + speed | view result */}
      <div style={{ flex: "0 0 auto", paddingInline: 14, paddingTop: 12, paddingBottom: 16 }}>
        {complete ? (
          <Btn variant="primary" fullWidth>{T("resolve.viewResult", null, locale)} ›</Btn>
        ) : (
          <>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
              <span style={{ fontSize: 11, color: tokens.textMuted, flex: "0 0 auto" }}>{T("resolve.speed", null, locale)}</span>
              <Segmented
                locale={locale}
                value="fast"
                options={[
                  { value: "normal", labelKey: "settings.speed.normal" },
                  { value: "fast", labelKey: "settings.speed.fast" },
                  { value: "instant", labelKey: "settings.speed.instant" },
                ]}
              />
            </div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, color: tokens.textMuted, fontSize: 12 }}>
              <span style={{ display: "inline-block", width: 14, height: 14, borderRadius: "50%", border: `2px solid ${tokens.borderStrong}`, borderTopColor: tokens.gold, animation: "tw-spin .8s linear infinite" }} />
              <span style={{ animation: "tw-pulse 1.4s ease-in-out infinite" }}>{T("resolve.resolving", null, locale)}</span>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

window.BattleResolveScreen = BattleResolveScreen;
