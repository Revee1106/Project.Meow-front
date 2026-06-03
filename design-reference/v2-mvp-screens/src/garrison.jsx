// Garrison — pushed route (NOT a tab). Extension of the occupied-node sheet.
// States: normal accruing, cap near-full, cap full, no rewards yet, node lost.
// Includes the Leave-confirmation modal.

const T = window.TowerI18n.t;
const {
  tokens, Btn, RewardChip, RewardList, PushHeader, Panel, ProgressBar,
  TimerPill, NodeStateBadge, NodeTypeBadge, EmptyState,
} = window.TowerUI;
const { useState } = React;

function fmtDuration(min) {
  const h = Math.floor(min / 60), m = min % 60;
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

function DefenseRow({ row, locale }) {
  const win = row.result === "win";
  const c = win ? tokens.teal : tokens.crimson;
  const timeParts = row.time.split(":");
  const timeLabel = T(timeParts[0], { n: timeParts[1] }, locale);
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 10,
      paddingInline: 12, paddingBlock: 10,
      borderBottom: `1px solid ${tokens.borderSubtle}`,
    }}>
      <span style={{
        width: 26, height: 26, borderRadius: 7, flex: "0 0 auto",
        background: c + "1f", color: c, display: "grid", placeItems: "center", fontSize: 13,
      }}>
        {win ? "⛨" : "✗"}
      </span>
      <span style={{ flex: "1 1 auto", minWidth: 0, fontSize: 12, color: tokens.textPrimary }}>
        {T(win ? "garrison.log.win" : "garrison.log.loss", { name: row.opponent }, locale)}
      </span>
      <span style={{ flex: "0 0 auto", fontSize: 10, color: tokens.textMuted }}>{timeLabel}</span>
      {row.fresh && <span style={{ width: 7, height: 7, borderRadius: "50%", background: c, flex: "0 0 auto" }} />}
    </div>
  );
}

function LeaveModal({ locale, onClose }) {
  return (
    <>
      <div onClick={onClose} style={{ position: "absolute", inset: 0, background: "rgba(7,5,9,.72)", zIndex: 8 }} />
      <div style={{
        position: "absolute", left: 0, right: 0, bottom: 0, zIndex: 9,
        background: tokens.surfaceRaised, borderTopLeftRadius: 18, borderTopRightRadius: 18,
        borderTop: `1px solid ${tokens.borderStrong}`, boxShadow: "0 -8px 32px rgba(0,0,0,.5)",
        paddingInline: 18, paddingTop: 16, paddingBottom: 18,
      }}>
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 12 }}>
          <span style={{ width: 36, height: 4, borderRadius: 2, background: tokens.borderStrong }} />
        </div>
        <div style={{
          width: 44, height: 44, borderRadius: 11, margin: "0 auto 12px",
          background: tokens.crimson + "1f", border: `1px solid ${tokens.crimsonDim}`,
          display: "grid", placeItems: "center", fontSize: 22, color: tokens.crimson,
        }}>⚠</div>
        <div className="tw-display" style={{ textAlign: "center", fontSize: 19, fontWeight: 700, color: tokens.textPrimary }}>
          {T("garrison.leaveConfirm.title", null, locale)}
        </div>
        <div style={{ textAlign: "center", fontSize: 12, color: tokens.textSecondary, lineHeight: 1.5, marginTop: 8, marginInline: 4 }}>
          {T("garrison.leaveConfirm.body", null, locale)}
        </div>
        <div style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 8 }}>
          <Btn variant="danger" fullWidth>{T("garrison.leaveConfirm.confirm", null, locale)}</Btn>
          <Btn variant="secondary" fullWidth onClick={onClose}>{T("common.cancel", null, locale)}</Btn>
        </div>
      </div>
    </>
  );
}

function GarrisonScreen({ data, locale, onBack, startModalOpen }) {
  const [modal, setModal] = useState(!!startModalOpen);
  const hasRewards = data.rewards && data.rewards.length > 0;
  const lost = data.lost;
  const claimAmount = hasRewards ? data.rewards[0].split(":")[1] : "0";

  return (
    <>
      <PushHeader title={T("garrison.pageTitle", null, locale)} onBack={onBack} accent={lost ? tokens.crimson : tokens.gold} />

      <div className="tw-scroll" style={{ flex: "1 1 auto", overflowY: "auto", paddingBottom: 14 }}>
        {/* node lost banner */}
        {lost && (
          <div style={{
            marginInline: 14, marginTop: 12,
            background: tokens.crimson + "14", border: `1px solid ${tokens.crimsonDim}`,
            borderLeft: `3px solid ${tokens.crimson}`, borderRadius: 8, padding: 12,
          }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: tokens.crimson, display: "flex", alignItems: "center", gap: 6 }}>
              <span>⚑</span>{T("garrison.lost.title", null, locale)}
            </div>
            <div style={{ fontSize: 11, color: tokens.textSecondary, marginTop: 4, lineHeight: 1.4 }}>
              {T("garrison.lost.body", { name: data.lostTo }, locale)}
            </div>
          </div>
        )}

        {/* current garrison hero card */}
        <div style={{
          marginInline: 14, marginTop: 12, borderRadius: 14, overflow: "hidden",
          background: `linear-gradient(180deg, ${(lost ? tokens.crimson : tokens.gold)}1f, transparent 55%), ${tokens.surfaceRaised}`,
          border: `1px solid ${lost ? tokens.crimsonDim : tokens.goldDim}`,
        }}>
          <div style={{ padding: 14 }}>
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 10 }}>
              <div style={{ flex: "1 1 auto", minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
                  <NodeTypeBadge type={data.nodeType} />
                  <NodeStateBadge state={lost ? "playerOccupied" : "occupiedByMe"} occupierName={data.lostTo} />
                </div>
                <div className="tw-display" style={{ fontSize: 22, fontWeight: 700, color: tokens.textPrimary, lineHeight: 1.1 }}>
                  {T(data.nodeNameKey, null, locale)}
                </div>
                <div style={{ fontSize: 11, color: tokens.textSecondary, marginTop: 3 }}>
                  {T("floor.title", { floor: data.floor }, locale)} · {T("garrison.duration", { time: fmtDuration(data.durationMin) }, locale)}
                </div>
              </div>
              <div style={{
                width: 46, height: 46, borderRadius: 11, flex: "0 0 auto",
                background: tokens.inset, border: `1px solid ${lost ? tokens.crimsonDim : tokens.goldDim}`,
                display: "grid", placeItems: "center", fontSize: 24, color: lost ? tokens.crimson : tokens.gold,
              }}>⛨</div>
            </div>
          </div>

          {/* accumulated rewards + cap */}
          <div style={{ paddingInline: 14, paddingBottom: 14, borderTop: `1px solid ${tokens.borderSubtle}`, paddingTop: 12 }}>
            <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: 1.2, textTransform: "uppercase", color: lost ? tokens.textMuted : tokens.gold }}>
              {T("garrison.accumulated", null, locale)}
            </div>
            {hasRewards ? (
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 8 }}>
                {data.rewards.map((r, i) => {
                  const [type, val] = r.split(":");
                  return <RewardChip key={i} type={type} amount={val} />;
                })}
              </div>
            ) : (
              <div style={{ fontSize: 12, color: tokens.textMuted, marginTop: 8 }}>
                {T("garrison.noRewardsYet", null, locale)}
              </div>
            )}

            {/* cap progress */}
            {!lost && (
              <div style={{ marginTop: 12 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                  <span style={{ fontSize: 10, color: tokens.textMuted, letterSpacing: 0.3 }}>{T("garrison.rewardCapProgress", null, locale)}</span>
                  {data.capFull ? (
                    <span style={{ fontSize: 10, fontWeight: 700, color: tokens.gold }}>{T("garrison.capFull", null, locale)}</span>
                  ) : (
                    <TimerPill label={T("garrison.capIn", { time: "" }, locale).replace("{time}", "").trim()} time={data.capInLabel} urgent={data.capUrgent} />
                  )}
                </div>
                <ProgressBar pct={data.capPct} urgent={data.capUrgent} full={data.capFull} />
                {data.capFull && <div style={{ fontSize: 10, color: tokens.gold, marginTop: 6 }}>{T("garrison.capFullNote", null, locale)}</div>}
                {data.capUrgent && !data.capFull && <div style={{ fontSize: 10, color: tokens.crimson, marginTop: 6 }}>{T("garrison.capNearNote", null, locale)}</div>}
              </div>
            )}
          </div>
        </div>

        {/* defense record summary */}
        <div style={{
          marginInline: 14, marginTop: 12, display: "flex", gap: 8,
        }}>
          <div style={{ flex: "1 1 0", background: tokens.surface, border: `1px solid ${tokens.borderSubtle}`, borderRadius: 10, padding: 12, textAlign: "center" }}>
            <div className="tw-num" style={{ fontSize: 20, fontWeight: 700, color: tokens.teal }}>{data.defenses.wins}</div>
            <div style={{ fontSize: 10, color: tokens.textMuted, marginTop: 2 }}>⛨ {T("reports.filter.defense", null, locale)}</div>
          </div>
          <div style={{ flex: "1 1 0", background: tokens.surface, border: `1px solid ${tokens.borderSubtle}`, borderRadius: 10, padding: 12, textAlign: "center" }}>
            <div className="tw-num" style={{ fontSize: 20, fontWeight: 700, color: data.defenses.losses ? tokens.crimson : tokens.textMuted }}>{data.defenses.losses}</div>
            <div style={{ fontSize: 10, color: tokens.textMuted, marginTop: 2 }}>✗ {T("report.nodeLost.title", null, locale)}</div>
          </div>
        </div>

        {/* defense log */}
        <div style={{
          marginInline: 14, marginTop: 14, marginBottom: 4,
          fontSize: 10, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", color: tokens.textMuted,
        }}>
          {T("garrison.defenseLog", null, locale)}
        </div>
        <Panel style={{ marginTop: 0 }}>
          {data.log.length > 0 ? (
            data.log.map((row, i) => <DefenseRow key={i} row={row} locale={locale} />)
          ) : (
            <EmptyState glyph="⛨" title={T("garrison.emptyLog.title", null, locale)} body={T("garrison.emptyLog.body", null, locale)} />
          )}
        </Panel>
      </div>

      {/* sticky footer */}
      <div style={{
        flex: "0 0 auto", paddingInline: 14, paddingTop: 10, paddingBottom: 16,
        background: tokens.surface, borderTop: `1px solid ${tokens.borderSubtle}`,
      }}>
        {lost ? (
          <Btn variant="primary" fullWidth onClick={onBack}>{T("result.action.return", null, locale)}</Btn>
        ) : (
          <>
            <Btn variant="primary" fullWidth disabled={!hasRewards}>
              ✦ {hasRewards ? T("garrison.claim", { amount: claimAmount }, locale) : T("garrison.claimEmpty", null, locale)}
            </Btn>
            <div style={{
              fontSize: 10, color: tokens.textMuted, lineHeight: 1.4, textAlign: "center",
              marginTop: 10, marginBottom: 8, paddingInline: 6,
            }}>
              {T("garrison.leaveWarning", null, locale)}
            </div>
            <Btn variant="danger" fullWidth onClick={() => setModal(true)}>{T("garrison.leave", null, locale)}</Btn>
          </>
        )}
      </div>

      {modal && <LeaveModal locale={locale} onClose={() => setModal(false)} />}
    </>
  );
}

window.GarrisonScreen = GarrisonScreen;
