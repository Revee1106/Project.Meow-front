import { useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "../../components/game/Button";
import { EmptyState } from "../../components/game/EmptyState";
import { NodeStateBadge, NodeTypeBadge } from "../../components/game/Badges";
import { RewardList } from "../../components/game/RewardList";
import { LeaveConfirmModal } from "../../components/LeaveConfirmModal";
import { MiniHead } from "../../components/MiniHead";
import { Panel } from "../../components/Panel";
import { ProgressBar } from "../../components/ProgressBar";
import { PushHeader } from "../../components/PushHeader";
import { t } from "../../i18n/strings";
import type { GarrisonDefenseEntry, GarrisonStateKey } from "../../services/types";
import {
  useClaimGarrisonRewardsMutation,
  useGarrisonQuery,
  useLeaveGarrisonNodeMutation,
} from "../../services/queries";
import { parseRewardTokens, rewardTokenAmount } from "../../utils/rewardTokens";
import { formatMinutes } from "../../utils/time";

const DEFAULT_NODE_ID = "n_med1";

export function GarrisonPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const nodeId = searchParams.get("nodeId") ?? DEFAULT_NODE_ID;
  const state = (searchParams.get("state") ?? undefined) as
    | GarrisonStateKey
    | undefined;
  const garrisonQuery = useGarrisonQuery(nodeId, { state });
  const claimRewards = useClaimGarrisonRewardsMutation();
  const leaveGarrison = useLeaveGarrisonNodeMutation();
  const [leaveOpen, setLeaveOpen] = useState(false);

  const data = garrisonQuery.data;
  const localRewards = useMemo(() => data?.rewards ?? [], [data?.rewards]);

  if (garrisonQuery.isLoading) {
    return <EmptyState title={t("state.loading")} />;
  }

  if (garrisonQuery.isError || !data) {
    return <EmptyState title={t("state.error.title")} body={t("state.error.body")} />;
  }

  const hasRewards = localRewards.length > 0;
  const lost = Boolean(data.lost);
  const progressVariant = data.capFull
    ? "full"
    : data.capUrgent
      ? "urgent"
      : "default";
  const returnToFloor = () => navigate(`/floor/${data.floor}`);
  const claimAmount = hasRewards ? rewardTokenAmount(localRewards[0]) : "0";

  const claim = () => {
    if (!hasRewards) {
      return;
    }

    claimRewards.mutate({ nodeId });
  };
  const confirmLeave = () => {
    leaveGarrison.mutate(
      { nodeId },
      {
        onSuccess: returnToFloor,
      },
    );
  };

  return (
    <div className="push-page garrison-page">
      <PushHeader
        title={t("garrison.pageTitle")}
        tone={lost ? "crimson" : "gold"}
        onBack={returnToFloor}
      />

      <div className="push-page__body">
        {lost ? (
          <div className="garrison-lost">
            <strong>{t("garrison.lost.title")}</strong>
            <span>{t("garrison.lost.body", { name: data.lostTo ?? "" })}</span>
          </div>
        ) : null}

        <Panel className={lost ? "garrison-hero garrison-hero--lost" : "garrison-hero"}>
          <div className="garrison-hero__top">
            <div>
              <div className="node-card__badges">
                <NodeTypeBadge type={data.nodeType} />
                <NodeStateBadge
                  occupierName={data.lostTo}
                  state={lost ? "playerOccupied" : "occupiedByMe"}
                />
              </div>
              <h2 className="tw-display">{t(data.nodeNameKey)}</h2>
              <p>
                {t("floor.title", { floor: data.floor })} /{" "}
                {t("garrison.duration", {
                  time: formatMinutes(data.durationMin),
                })}
              </p>
            </div>
            <span aria-hidden="true" className="garrison-hero__mark">
              G
            </span>
          </div>

          <div className="garrison-rewards">
            <MiniHead title={t("garrison.accumulated")} />
            {hasRewards ? (
              <RewardList rewards={parseRewardTokens(localRewards)} />
            ) : (
              <div className="result-empty-line">{t("garrison.noRewardsYet")}</div>
            )}

            {!lost ? (
              <div className="garrison-progress">
                <div className="garrison-progress__top">
                  <span>{t("garrison.rewardCapProgress")}</span>
                  <strong>
                    {data.capFull
                      ? t("garrison.capFull")
                      : t("garrison.capIn", { time: data.capInLabel })}
                  </strong>
                </div>
                <ProgressBar value={data.capPct} variant={progressVariant} />
                {data.capFull ? (
                  <p>{t("garrison.capFullNote")}</p>
                ) : data.capUrgent ? (
                  <p className="is-danger">{t("garrison.capNearNote")}</p>
                ) : null}
              </div>
            ) : null}
          </div>
        </Panel>

        <div className="garrison-record">
          <Panel>
            <strong className="tw-num is-good">{data.defenses.wins}</strong>
            <span>{t("garrison.defenseWins")}</span>
          </Panel>
          <Panel>
            <strong className={data.defenses.losses ? "tw-num is-danger" : "tw-num"}>
              {data.defenses.losses}
            </strong>
            <span>{t("garrison.defenseLosses")}</span>
          </Panel>
        </div>

        <MiniHead title={t("garrison.defenseLog")} />
        <Panel>
          {data.log.length ? (
            data.log.map((row, index) => <DefenseRow key={`${row.opponent}-${index}`} row={row} />)
          ) : (
            <EmptyState
              body={t("garrison.emptyLog.body")}
              title={t("garrison.emptyLog.title")}
            />
          )}
        </Panel>
      </div>

      <footer className="push-page__footer">
        {lost ? (
          <Button fullWidth onClick={returnToFloor}>
            {t("garrison.return")}
          </Button>
        ) : (
          <>
            <Button
              disabled={!hasRewards || claimRewards.isPending}
              fullWidth
              onClick={claim}
            >
              {hasRewards
                ? t("garrison.claim", { amount: claimAmount })
                : t("garrison.claimEmpty")}
            </Button>
            <p>{t("garrison.leaveWarning")}</p>
            <Button fullWidth variant="danger" onClick={() => setLeaveOpen(true)}>
              {t("garrison.leave")}
            </Button>
          </>
        )}
      </footer>

      <LeaveConfirmModal
        body={t("garrison.leaveConfirm.body")}
        cancelLabel={t("common.cancel")}
        confirmLabel={t("garrison.leaveConfirm.confirm")}
        open={leaveOpen}
        pending={leaveGarrison.isPending}
        title={t("garrison.leaveConfirm.title")}
        onCancel={() => setLeaveOpen(false)}
        onConfirm={confirmLeave}
      />
    </div>
  );
}

function DefenseRow({ row }: { row: GarrisonDefenseEntry }) {
  const win = row.result === "win";
  const timeLabel = resolveTimeLabel(row.time);

  return (
    <div className="defense-row">
      <span className={win ? "defense-row__mark is-good" : "defense-row__mark is-danger"} aria-hidden="true">
        {win ? "✓" : "!"}
      </span>
      <span>
        {t(win ? "garrison.log.win" : "garrison.log.loss", {
          name: row.opponent,
        })}
      </span>
      <time>{timeLabel}</time>
      {row.fresh ? <em aria-hidden="true" /> : null}
    </div>
  );
}

function resolveTimeLabel(value: string) {
  const [key, arg] = value.split(":");
  return t(key, { n: arg ?? "" });
}
