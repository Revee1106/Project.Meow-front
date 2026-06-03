import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { CombatantAvatar } from "../../components/CombatantAvatar";
import { EmptyState } from "../../components/game/EmptyState";
import { Button } from "../../components/game/Button";
import { NodeTypeBadge } from "../../components/game/Badges";
import { RewardList } from "../../components/game/RewardList";
import { GearCard } from "../../components/GearCard";
import { MiniHead } from "../../components/MiniHead";
import { Panel } from "../../components/Panel";
import { PushHeader } from "../../components/PushHeader";
import { t } from "../../i18n/strings";
import { equippedCpBySlot } from "../../mocks/fixtures/gear";
import {
  useBattleResultQuery,
  useEquipGearMutation,
  useOccupyBattleNodeMutation,
} from "../../services/queries";
import { parseRewardTokens } from "../../utils/rewardTokens";

const DEFAULT_BATTLE_ID = "victoryNpc";

export function BattleResultPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const battleId = searchParams.get("battleId") ?? DEFAULT_BATTLE_ID;
  const resultQuery = useBattleResultQuery(battleId);
  const occupyNode = useOccupyBattleNodeMutation();
  const equipGear = useEquipGearMutation();
  const [equippedDropId, setEquippedDropId] = useState<string | null>(null);

  useEffect(() => {
    if (!searchParams.get("battleId") && import.meta.env.DEV) {
      console.warn("Missing battleId query param; defaulting to victoryNpc.");
    }
  }, [searchParams]);

  const data = resultQuery.data;
  const enemyName = useMemo(() => {
    if (!data) {
      return "";
    }

    return data.opponentKind === "npc"
      ? t(data.enemyNameKey ?? data.nodeNameKey)
      : (data.enemyName ?? "");
  }, [data]);

  if (resultQuery.isLoading) {
    return <EmptyState title={t("state.loading")} />;
  }

  if (resultQuery.isError || !data) {
    return <EmptyState title={t("state.error.title")} body={t("state.error.body")} />;
  }

  const win = data.outcome === "victory";
  const drop = data.drop;
  const dropDelta = drop ? (drop.cp ?? 0) - equippedCpBySlot[drop.slot] : 0;
  const canEquip = Boolean(drop && dropDelta > 0 && equippedDropId !== drop.id);
  const hasRewards = data.rewards.length > 0;

  const returnToFloor = () => navigate(`/floor/${data.floor}`);
  const occupy = () => {
    occupyNode.mutate(
      { nodeId: data.nodeId, battleId: data.id },
      {
        onSuccess: () => {
          navigate(`/garrison?nodeId=${data.nodeId}`, { replace: true });
        },
      },
    );
  };
  const equip = () => {
    if (!drop) {
      return;
    }

    equipGear.mutate(
      { gearId: drop.id },
      {
        onSuccess: () => {
          setEquippedDropId(drop.id);
        },
      },
    );
  };

  return (
    <div className="push-page battle-result-page">
      <PushHeader
        title={t(win ? "battleResult.victory" : "battleResult.defeat")}
        tone={win ? "gold" : "crimson"}
        onBack={returnToFloor}
      />

      <section className={`result-hero result-hero--${data.outcome}`}>
        <div className="result-hero__kicker">
          <span aria-hidden="true">{win ? "✦" : "!"}</span>
          <span>{t(win ? "battleResult.victory" : "battleResult.defeat")}</span>
          <span aria-hidden="true">{win ? "✦" : "!"}</span>
        </div>
        <h2 className="tw-display">
          {t(
            win
              ? data.opponentKind === "npc"
                ? "battleResult.subtitleNpc"
                : "battleResult.subtitlePlayer"
              : "battleResult.subtitleDefeat",
            { name: enemyName },
          )}
        </h2>
        {data.upset ? <div className="result-upset">{t("battleResult.upset")}</div> : null}
        <div className="versus-block">
          <CombatantAvatar cp={data.myCP} kind="me" name={t("battleResult.you")} />
          <div className="versus-block__sep">
            <span className="tw-display">{t("battleResult.vs")}</span>
            <em className="tw-num">{formatSigned(data.myCP - data.enemyCP)}</em>
          </div>
          <CombatantAvatar
            cp={data.enemyCP}
            kind={data.opponentKind}
            name={data.opponentKind === "player" ? data.enemyName : undefined}
            nameKey={data.opponentKind === "npc" ? data.enemyNameKey : undefined}
            upset={data.upset}
          />
        </div>
      </section>

      <div className="push-page__body">
        {data.nodeUnlocked && win ? (
          <div className="result-unlocked">
            <span aria-hidden="true">✓</span>
            <span>{t("battleResult.nodeUnlocked")}</span>
          </div>
        ) : null}

        <Panel className="result-node-panel">
          <div>
            <NodeTypeBadge type={data.nodeType} />
            <strong className="tw-display">{t(data.nodeNameKey)}</strong>
          </div>
          <span>{t("floor.title", { floor: data.floor })}</span>
        </Panel>

        <MiniHead title={t("battleResult.summary")} />
        <Panel>
          <div className="result-stat-grid">
            <StatCell label={t("battleResult.rounds")} value={data.stats.rounds} />
            <StatCell
              good
              label={t("battleResult.dmgDealt")}
              value={data.stats.dmgDealt.toLocaleString()}
            />
            <StatCell
              danger
              label={t("battleResult.dmgTaken")}
              value={data.stats.dmgTaken.toLocaleString()}
            />
            <StatCell
              label={t("battleResult.hpLeft")}
              value={`${data.stats.hpLeft}%`}
            />
          </div>
        </Panel>

        <MiniHead title={t("battleResult.rewards")} />
        <Panel>
          {hasRewards ? (
            <div className="result-rewards">
              <RewardList rewards={parseRewardTokens(data.rewards)} />
            </div>
          ) : (
            <div className="result-empty-line">{t("battleResult.noRewards")}</div>
          )}
        </Panel>

        {drop ? (
          <>
            <MiniHead title={t("battleResult.gearDrop")} />
            <div className="result-gear">
              <GearCard delta={dropDelta} gear={drop} />
              <div className={dropDelta > 0 ? "result-gear__delta is-good" : "result-gear__delta"}>
                {dropDelta > 0
                  ? t("battleResult.betterBy", { n: dropDelta })
                  : t("battleResult.notBetter")}
              </div>
            </div>
          </>
        ) : win ? (
          <>
            <MiniHead title={t("battleResult.gearDrop")} />
            <Panel>
              <div className="result-empty-line">{t("battleResult.noGearDrop")}</div>
            </Panel>
          </>
        ) : null}
      </div>

      <footer className="push-page__footer">
        {win ? (
          <>
            {canEquip ? (
              <Button disabled={equipGear.isPending} fullWidth onClick={equip}>
                {t("battleResult.actionEquip")}
              </Button>
            ) : null}
            {data.canOccupy ? (
              <Button
                disabled={occupyNode.isPending}
                fullWidth
                variant={canEquip ? "ghost" : "primary"}
                onClick={occupy}
              >
                {t("battleResult.actionOccupy")}
              </Button>
            ) : null}
            <Button fullWidth variant="secondary" onClick={returnToFloor}>
              {t("battleResult.actionReturn")}
            </Button>
          </>
        ) : (
          <>
            <Button fullWidth onClick={() => navigate(`/floor/${data.floor}?node=${data.nodeId}`)}>
              {t("battleResult.actionRetry")}
            </Button>
            <Button fullWidth variant="secondary" onClick={returnToFloor}>
              {t("battleResult.actionReturn")}
            </Button>
          </>
        )}
      </footer>
    </div>
  );
}

function StatCell({
  label,
  value,
  good,
  danger,
}: {
  label: string;
  value: string | number;
  good?: boolean;
  danger?: boolean;
}) {
  return (
    <div className="result-stat">
      <strong className={["tw-num", good ? "is-good" : "", danger ? "is-danger" : ""]
        .filter(Boolean)
        .join(" ")}
      >
        {value}
      </strong>
      <span>{label}</span>
    </div>
  );
}

function formatSigned(value: number) {
  return value > 0 ? `+${value.toLocaleString()}` : value.toLocaleString();
}
