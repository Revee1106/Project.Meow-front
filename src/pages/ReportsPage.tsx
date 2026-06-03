import { useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { EmptyState } from "../components/game/EmptyState";
import {
  QueryErrorState,
  QueryLoadingState,
} from "../components/game/QueryState";
import { RewardList } from "../components/game/RewardList";
import { ListRow } from "../components/ListRow";
import { Segmented } from "../components/Segmented";
import { t } from "../i18n/strings";
import {
  useMarkReportsReadMutation,
  useReportsQuery,
} from "../services/queries";
import type { Report } from "../services/types";
import { useReportsStore } from "../stores/reportsStore";

const REPORT_META: Record<
  Report["kind"],
  { glyph: string; tone: "teal" | "crimson"; group: "attack" | "defense" }
> = {
  attackWin: { glyph: "A", tone: "teal", group: "attack" },
  attackLoss: { glyph: "A", tone: "crimson", group: "attack" },
  defenseWin: { glyph: "D", tone: "teal", group: "defense" },
  nodeLost: { glyph: "L", tone: "crimson", group: "defense" },
};

type ReportFilter = "all" | "attack" | "defense";

export function ReportsPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const reportsQuery = useReportsQuery();
  const markRead = useMarkReportsReadMutation();
  const filter = useReportsStore((store) => store.filter);
  const setFilter = useReportsStore((store) => store.setFilter);
  const rows = useMemo(() => reportsQuery.data?.rows ?? [], [reportsQuery.data?.rows]);
  const unread = rows.filter((row) => row.unread).length;
  const queryFilter = searchParams.get("filter");
  const activeFilter: ReportFilter =
    queryFilter === "attack" || queryFilter === "defense"
      ? queryFilter
      : filter === "lost"
        ? "defense"
        : filter;
  const visibleRows = useMemo(
    () =>
      activeFilter === "all"
        ? rows
        : rows.filter((row) => REPORT_META[row.kind].group === activeFilter),
    [activeFilter, rows],
  );

  if (reportsQuery.isLoading) {
    return <QueryLoadingState />;
  }

  if (reportsQuery.isError) {
    return <QueryErrorState onRetry={() => void reportsQuery.refetch()} />;
  }

  const markAllRead = () => {
    if (unread) {
      markRead.mutate();
    }
  };

  return (
    <div className="reports-page">
      <header className="reports-header">
        <div>
          <h1 className="tw-display">{t("reports.title")}</h1>
          {unread ? <span className="tw-num">{unread}</span> : null}
        </div>
        {unread ? (
          <button disabled={markRead.isPending} type="button" onClick={markAllRead}>
            {t("reports.markAll")}
          </button>
        ) : null}
      </header>

      {rows.length ? (
        <div className="reports-filter">
          <Segmented<ReportFilter>
            ariaLabel={t("reports.filter.label")}
            options={[
              { value: "all", labelKey: "reports.filter.all" },
              { value: "attack", labelKey: "reports.filter.attack" },
              { value: "defense", labelKey: "reports.filter.defense" },
            ]}
            value={activeFilter}
            onChange={setFilter}
          />
        </div>
      ) : null}

      <div className="reports-scroll tw-scroll">
        {visibleRows.length ? (
          <section className="reports-list">
            {visibleRows.map((report) => (
              <ReportRow
                key={report.id}
                report={report}
                onClick={() =>
                  navigate(
                    `/battle/resolve?battleId=${report.battleId ?? "victoryNpc"}&phase=complete`,
                  )
                }
              />
            ))}
          </section>
        ) : (
          <EmptyState
            body={t("reports.empty.body")}
            title={t("reports.empty.title")}
          />
        )}
      </div>
    </div>
  );
}

function ReportRow({
  report,
  onClick,
}: {
  report: Report;
  onClick: () => void;
}) {
  const meta = REPORT_META[report.kind];
  const nodeName = t(report.nodeNameKey);
  const subtitle = (
    <>
      <span>
        {t(`report.${report.kind}.sub`, {
          name: report.opponentName,
          node: nodeName,
        })}
      </span>
      {report.rewards?.length ? (
        <span className="report-row__rewards">
          <RewardList rewards={report.rewards} />
        </span>
      ) : null}
    </>
  );

  return (
    <ListRow
      icon={<span className={`report-icon report-icon--${meta.tone}`}>{meta.glyph}</span>}
      right={
        <span className="report-row__right">
          <time>{resolveTimeLabel(report)}</time>
          <strong>{t("report.viewReplay")}</strong>
        </span>
      }
      subtitle={subtitle}
      title={t(`report.${report.kind}.title`)}
      unread={report.unread}
      danger={meta.tone === "crimson"}
      onClick={onClick}
    />
  );
}

function resolveTimeLabel(report: Report) {
  if (report.time) {
    const [key, arg] = report.time.split(":");
    return t(key, { n: arg ?? "" });
  }

  return t("time.minAgo", { n: 1 });
}
