import { useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/game/Button";
import { PlayerChip } from "../components/game/PlayerChip";
import {
  QueryErrorState,
  QueryLoadingState,
} from "../components/game/QueryState";
import { RewardList } from "../components/game/RewardList";
import { SectionHead } from "../components/game/SectionHead";
import { DEFAULT_GARRISON } from "../components/floor/floorDerivation";
import { t } from "../i18n/strings";
import {
  syncClientStores,
  useClaimGarrisonMutation,
  useHomeBootstrapQuery,
  useLeaveGarrisonMutation,
} from "../services/queries";
import type { ActivityRow, TowerNode } from "../services/types";
import { useNotifStore } from "../stores/notifStore";
import { usePlayerStore } from "../stores/playerStore";
import { useUiStore } from "../stores/uiStore";
import { useLazySlice } from "../hooks/useLazySlice";
import { rewardMapToList } from "../utils/rewards";
import { formatMinutes } from "../utils/time";
import { resolveHomePrimaryCta } from "./homeCta";

export function HomePage() {
  const navigate = useNavigate();
  const player = usePlayerStore((store) => store.player);
  const redDots = useNotifStore((store) => store.redDots);
  const openConfirm = useUiStore((store) => store.openConfirm);
  const showToast = useUiStore((store) => store.showToast);
  const bootstrapQuery = useHomeBootstrapQuery();
  const claimGarrison = useClaimGarrisonMutation();
  const leaveGarrison = useLeaveGarrisonMutation();

  useEffect(() => {
    if (bootstrapQuery.data) {
      syncClientStores(bootstrapQuery.data.player, bootstrapQuery.data.redDots);
    }
  }, [bootstrapQuery.data]);

  const bootstrap = bootstrapQuery.data;
  const floor = bootstrap?.floor;
  const activity = bootstrap?.activity ?? [];
  const activitySlice = useLazySlice(activity);
  const garrisonNode = useMemo(() => {
    if (!floor) {
      return undefined;
    }

    return (
      floor.nodes.find((node) => node.id === player.garrisonNodeId) ??
      floor.nodes.find((node) => node.state === "occupiedByMe")
    );
  }, [floor, player.garrisonNodeId]);

  const primaryCta = useMemo(() => {
    const claimAmount =
      garrisonNode?.garrison?.accumulated.gold?.toLocaleString() ?? "0";
    const cta = resolveHomePrimaryCta({
      claimAmount,
      floor,
      playerState: player.state,
    });

    if (cta.kind === "claimRewards") {
      return {
        label: t(cta.labelKey, cta.vars),
        action: () => {
          if (garrisonNode) {
            claimGarrison.mutate(garrisonNode.id, {
              onSuccess: () => {
                showToast({ message: t("toast.claimedRewards") });
              },
            });
          }
        },
      };
    }

    return {
      label: t(cta.labelKey),
      action: () => navigate(cta.to),
    };
  }, [claimGarrison, floor, garrisonNode, navigate, player.state, showToast]);

  if (bootstrapQuery.isLoading) {
    return <QueryLoadingState />;
  }

  if (bootstrapQuery.isError) {
    return <QueryErrorState onRetry={() => void bootstrapQuery.refetch()} />;
  }

  if (!bootstrap || !floor) {
    return <QueryErrorState onRetry={() => void bootstrapQuery.refetch()} />;
  }

  const hasReports = Boolean(redDots.reports);
  const reportActivity = activity.find((row) => row.fresh) ?? activity[0];

  return (
    <div className="home-page">
      <PlayerChip player={player} />
      {player.state === "garrisoning" && garrisonNode ? (
        <GarrisonPreview
          floor={floor.floor}
          node={garrisonNode}
          onClick={() => navigate(`/garrison?nodeId=${garrisonNode.id}`)}
        />
      ) : (
        <TowerPreview floor={floor.floor} floorNameKey={floor.nameKey} />
      )}

      <div className="home-meta">
        <span>{t("home.highestUnlocked")}</span>
        <span className="tw-num">
          {t("home.floorOf", { floor: floor.floor, max: 5 })}
        </span>
        <span className="home-meta__dots" aria-hidden="true">
          {[1, 2, 3, 4, 5].map((item) => (
            <span
              className={
                item <= floor.floor ? "home-meta__dot is-on" : "home-meta__dot"
              }
              key={item}
            />
          ))}
        </span>
      </div>

      {hasReports ? (
        <button
          className="home-report"
          type="button"
          onClick={() => navigate("/reports")}
        >
          <span className="home-report__mark" aria-hidden="true" />
          <span>
            {t("home.notif.newReports", { count: 1 })}:{" "}
            <strong>
              {reportActivity
                ? t(
                    `home.activity.${reportActivity.type}`,
                    resolveActivityVars(reportActivity.vars),
                  )
                : t("route.reports.title")}
            </strong>
          </span>
        </button>
      ) : null}

      <div className="home-ctas">
        <Button fullWidth onClick={primaryCta.action}>
          {primaryCta.label}
        </Button>
        {player.state === "garrisoning" ? (
          <Button
            fullWidth
            variant="secondary"
            onClick={() => {
              if (!garrisonNode) {
                return;
              }

              openConfirm({
                title: t("confirm.leaveNode.title"),
                body: t("confirm.leaveNode.body", {
                  nodeName: t(garrisonNode.nameKey),
                }),
                confirmLabel: t("node.action.leave"),
                cancelLabel: t("common.cancel"),
                danger: true,
                onConfirm: () => {
                  leaveGarrison.mutate(
                    { nodeId: garrisonNode.id, claim: false },
                    {
                      onSuccess: () => {
                        showToast({
                          message: t("toast.leftNode", {
                            nodeName: t(garrisonNode.nameKey),
                          }),
                        });
                      },
                    },
                  );
                },
              });
            }}
          >
            {t("home.cta.leaveNode")}
          </Button>
        ) : null}
      </div>

      <SectionHead title={t("home.quick.title")} />
      <div className="quick-actions">
        <QuickAction
          label={t("home.quick.equipment")}
          mark="G"
          onClick={() => navigate("/equipment")}
          redDot={redDots.equipment}
        />
        <QuickAction
          label={t("home.quick.reports")}
          mark="R"
          onClick={() => navigate("/reports")}
          redDot={redDots.reports}
        />
        <QuickAction
          label={t("home.quick.garrison")}
          mark="S"
          muted={player.state !== "garrisoning"}
          onClick={() =>
            navigate(
              garrisonNode
                ? `/garrison?nodeId=${garrisonNode.id}`
                : "/garrison",
            )
          }
        />
        <QuickAction label={t("home.quick.ranks")} mark="K" muted />
      </div>

      <SectionHead
        title={t("home.activity.title")}
        right={<span>{t("common.viewAll")}</span>}
      />
      <div className="activity-list">
        {activity.length ? (
          activitySlice.visibleItems.map((row, index) => (
            <ActivityItem key={index} row={row} />
          ))
        ) : (
          <div className="activity-list__empty">{t("home.activity.empty")}</div>
        )}
        {activitySlice.hasMore ? (
          <div className="activity-list__more">
            <Button small variant="ghost" onClick={activitySlice.showMore}>
              {t("common.showMore")}
            </Button>
          </div>
        ) : null}
      </div>

      {player.state === "garrisoning" ? (
        <p className="home-reminder">{t("garrison.reminder")}</p>
      ) : null}
    </div>
  );
}

function TowerPreview({
  floor,
  floorNameKey,
}: {
  floor: number;
  floorNameKey: string;
}) {
  return (
    <section className="tower-preview">
      <div className="tower-preview__top">
        <span>{t("tower.title")}</span>
        <span>{t("app.name")}</span>
      </div>
      <div>
        <h1 className="tw-display">{t("floor.title", { floor })}</h1>
        <p>{t(floorNameKey)}</p>
      </div>
    </section>
  );
}

function GarrisonPreview({
  node,
  floor,
  onClick,
}: {
  node: TowerNode;
  floor: number;
  onClick: () => void;
}) {
  const accumulated =
    node.garrison?.accumulated ?? DEFAULT_GARRISON.accumulated;

  return (
    <button className="garrison-preview" type="button" onClick={onClick}>
      <div className="garrison-preview__top">
        <div>
          <div className="garrison-preview__eyebrow">{t("garrison.title")}</div>
          <h1 className="tw-display">{t(node.nameKey)}</h1>
          <p>
            {t("floor.title", { floor })} /{" "}
            {t("garrison.duration", {
              time: formatMinutes(
                node.garrison?.startedMin ?? DEFAULT_GARRISON.startedMin,
              ),
            })}
          </p>
        </div>
        <div className="garrison-preview__mark" aria-hidden="true">
          G
        </div>
      </div>
      <RewardList rewards={rewardMapToList(accumulated)} />
      <div className="garrison-preview__cap">
        <span>
          {t("garrison.capIn", {
            time: formatMinutes(
              node.garrison?.capInMin ?? DEFAULT_GARRISON.capInMin,
            ),
          })}
        </span>
        <span className="garrison-preview__bar">
          <span />
        </span>
      </div>
    </button>
  );
}

function QuickAction({
  label,
  mark,
  muted,
  onClick,
  redDot,
}: {
  label: string;
  mark: string;
  muted?: boolean;
  onClick?: () => void;
  redDot?: boolean | number;
}) {
  return (
    <button
      className={muted ? "quick-action quick-action--muted" : "quick-action"}
      type="button"
      onClick={onClick}
    >
      <span className="quick-action__mark">{mark}</span>
      <span>{label}</span>
      {redDot ? <span className="quick-action__dot" /> : null}
    </button>
  );
}

function ActivityItem({ row }: { row: ActivityRow }) {
  return (
    <div className="activity-item">
      <span
        className="activity-item__mark"
        aria-label={t("activity.iconLabel")}
      />
      <span>
        {t(`home.activity.${row.type}`, resolveActivityVars(row.vars))}
      </span>
      <time>{t(row.timeKey, row.timeVars)}</time>
      {row.fresh ? <span className="activity-item__fresh" /> : null}
    </div>
  );
}

function resolveActivityVars(vars: ActivityRow["vars"]) {
  return Object.fromEntries(
    Object.entries(vars).map(([key, value]) => {
      if (key.endsWith("Key") && typeof value === "string") {
        return [key.slice(0, -3), t(value)];
      }

      return [key, value];
    }),
  );
}
