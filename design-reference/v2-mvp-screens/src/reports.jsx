// Reports — bottom-tab screen. Async PvP / defense records.
// Rows: attackWin, attackLoss, defenseWin, nodeLost. + empty state.

const T = window.TowerI18n.t;
const { tokens, TabBar, RewardChip, Segmented, EmptyState, RedDot } = window.TowerUI;
const { useState } = React;

const REPORT_META = {
  attackWin:  { glyph: "⚔", color: tokens.teal,    group: "attack"  },
  attackLoss: { glyph: "⚔", color: tokens.crimson, group: "attack"  },
  defenseWin: { glyph: "⛨", color: tokens.teal,    group: "defense" },
  nodeLost:   { glyph: "⚑", color: tokens.crimson, group: "defense" },
};

function ReportRow({ report, locale, last }) {
  const meta = REPORT_META[report.type];
  const timeParts = report.time.split(":");
  const timeLabel = T(timeParts[0], { n: timeParts[1] }, locale);
  return (
    <button style={{
      width: "100%", textAlign: "left", display: "flex", gap: 11, alignItems: "flex-start",
      paddingInline: 12, paddingBlock: 12, minHeight: 44, cursor: "pointer",
      background: report.unread ? tokens.crimson + "08" : "transparent",
      border: "none", borderBottom: last ? "none" : `1px solid ${tokens.borderSubtle}`,
      fontFamily: tokens.fontUI, position: "relative",
    }}>
      <span style={{
        flex: "0 0 auto", width: 36, height: 36, borderRadius: 9,
        background: meta.color + "1c", color: meta.color,
        display: "grid", placeItems: "center", fontSize: 17,
      }}>{meta.glyph}</span>

      <span style={{ flex: "1 1 auto", minWidth: 0 }}>
        <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: tokens.textPrimary }}>{T(`report.${report.type}.title`, null, locale)}</span>
          {report.unread && <RedDot dotOnly />}
        </span>
        <span style={{ display: "block", fontSize: 11, color: tokens.textSecondary, marginTop: 2, lineHeight: 1.35 }}>
          {T(`report.${report.type}.sub`, { name: report.opponent, node: T(report.nodeKey, null, locale) }, locale)}
        </span>
        {report.rewards.length > 0 && (
          <span style={{ display: "flex", flexWrap: "wrap", gap: 4, marginTop: 6 }}>
            {report.rewards.map((r, i) => {
              const [type, val] = r.split(":");
              return <RewardChip key={i} type={type} amount={val} />;
            })}
          </span>
        )}
      </span>

      <span style={{ flex: "0 0 auto", display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 8 }}>
        <span style={{ fontSize: 10, color: tokens.textMuted, whiteSpace: "nowrap" }}>{timeLabel}</span>
        <span style={{
          fontSize: 10, fontWeight: 700, color: tokens.gold,
          border: `1px solid ${tokens.goldDim}`, borderRadius: 6, paddingInline: 8, paddingBlock: 3,
        }}>{T("report.viewReplay", null, locale)} ›</span>
      </span>
    </button>
  );
}

function ReportsScreen({ empty, locale }) {
  const all = empty ? [] : window.TowerData.Reports;
  const [filter, setFilter] = useState("all");
  const unread = all.filter((r) => r.unread).length;
  const list = filter === "all" ? all : all.filter((r) => REPORT_META[r.type].group === filter);

  return (
    <>
      {/* header */}
      <div style={{
        flex: "0 0 auto", paddingInline: 14, paddingTop: 12, paddingBottom: 10,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        borderBottom: `1px solid ${tokens.borderSubtle}`,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span className="tw-display" style={{ fontSize: 18, fontWeight: 700 }}>{T("reports.title", null, locale)}</span>
          {unread > 0 && <RedDot count={unread} />}
        </div>
        {unread > 0 && <span style={{ fontSize: 11, color: tokens.gold, fontWeight: 600 }}>{T("reports.markAll", null, locale)}</span>}
      </div>

      {!empty && (
        <div style={{ flex: "0 0 auto", paddingInline: 14, paddingTop: 10, paddingBottom: 4 }}>
          <Segmented
            locale={locale} value={filter} onChange={setFilter}
            options={[
              { value: "all", labelKey: "reports.filter.all" },
              { value: "attack", labelKey: "reports.filter.attack" },
              { value: "defense", labelKey: "reports.filter.defense" },
            ]}
          />
        </div>
      )}

      <div className="tw-scroll" style={{ flex: "1 1 auto", overflowY: "auto", paddingBottom: 12 }}>
        {list.length === 0 ? (
          <EmptyState glyph="📜" title={T("reports.empty.title", null, locale)} body={T("reports.empty.body", null, locale)} />
        ) : (
          <div style={{
            marginInline: 14, marginTop: 10,
            background: tokens.surface, border: `1px solid ${tokens.borderSubtle}`, borderRadius: 12, overflow: "hidden",
          }}>
            {list.map((r, i) => <ReportRow key={r.id} report={r} locale={locale} last={i === list.length - 1} />)}
          </div>
        )}
      </div>

      <TabBar active="reports" redDots={{ reports: unread > 0, equipment: true }} />
    </>
  );
}

window.ReportsScreen = ReportsScreen;
