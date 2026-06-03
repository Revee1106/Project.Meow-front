import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { CombatantAvatar } from "../../components/CombatantAvatar";
import { EmptyState } from "../../components/game/EmptyState";
import { Button } from "../../components/game/Button";
import { HPBar } from "../../components/HPBar";
import { Segmented } from "../../components/Segmented";
import { t } from "../../i18n/strings";
import { queryKeys, useBattleResolveQuery } from "../../services/queries";
import type { BattleResolveLogEntry } from "../../services/types";
import { useQueryClient } from "@tanstack/react-query";

const DEFAULT_BATTLE_ID = "victoryNpc";

type BattleSpeed = "normal" | "fast" | "instant";

const SPEED_MS: Record<BattleSpeed, number> = {
  normal: 850,
  fast: 420,
  instant: 0,
};

export function BattleResolvePage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const battleId = searchParams.get("battleId") ?? DEFAULT_BATTLE_ID;
  const phaseParam = searchParams.get("phase");
  const resolveQuery = useBattleResolveQuery(battleId);
  const [speed, setSpeed] = useState<BattleSpeed>("fast");
  const [visibleLines, setVisibleLines] = useState(
    phaseParam === "complete" ? Number.MAX_SAFE_INTEGER : 3,
  );
  const [complete, setComplete] = useState(phaseParam === "complete");

  useEffect(() => {
    if (!searchParams.get("battleId") && import.meta.env.DEV) {
      console.warn("Missing battleId query param; defaulting to victoryNpc.");
    }
  }, [searchParams]);

  const payload = resolveQuery.data;
  const battle = payload?.battle;
  const log = payload?.log ?? [];

  useEffect(() => {
    if (battle) {
      queryClient.setQueryData(queryKeys.battleResult(battleId), battle);
    }
  }, [battle, battleId, queryClient]);

  useEffect(() => {
    if (!log.length || complete) {
      return;
    }

    if (speed === "instant") {
      setVisibleLines(log.length);
      setComplete(true);
      return;
    }

    if (visibleLines >= log.length) {
      setComplete(true);
      return;
    }

    const timer = globalThis.setTimeout(() => {
      setVisibleLines((current) => Math.min(log.length, current + 1));
    }, SPEED_MS[speed]);

    return () => globalThis.clearTimeout(timer);
  }, [complete, log.length, speed, visibleLines]);

  useEffect(() => {
    if (!complete || phaseParam === "complete") {
      return;
    }

    const timer = globalThis.setTimeout(() => {
      navigate(`/battle/result?battleId=${battleId}`, { replace: true });
    }, 1200);

    return () => globalThis.clearTimeout(timer);
  }, [battleId, complete, navigate, phaseParam]);

  const enemyName = useMemo(() => {
    if (!battle) {
      return "";
    }

    return battle.opponentKind === "npc"
      ? t(battle.enemyNameKey ?? battle.nodeNameKey)
      : (battle.enemyName ?? "");
  }, [battle]);

  if (resolveQuery.isLoading) {
    return <EmptyState title={t("state.loading")} />;
  }

  if (resolveQuery.isError || !battle) {
    return <EmptyState title={t("state.error.title")} body={t("state.error.body")} />;
  }

  const shownLines = log.slice(0, complete ? log.length : visibleLines);
  const hp = deriveHp(shownLines, complete);
  const goResult = () => navigate(`/battle/result?battleId=${battleId}`, { replace: true });

  return (
    <div className="battle-resolve-page">
      <header className="resolve-topbar">
        <span>
          {complete
            ? t("resolve.title")
            : t("resolve.round", { n: Math.min(visibleLines, log.length) })}
        </span>
        {!complete ? (
          <button type="button" onClick={goResult}>
            {t("resolve.skip")}
          </button>
        ) : null}
      </header>

      <section className="resolve-combatants">
        <div className="resolve-combatant-row">
          <CombatantAvatar cp={battle.myCP} kind="me" name={t("battleResult.you")} />
          <div className="resolve-hp-block">
            <div>
              <span>{t("battleResult.you")}</span>
              <strong className="tw-num">{hp.my}%</strong>
            </div>
            <HPBar side="me" value={hp.my} />
          </div>
        </div>

        <div className="resolve-divider">
          <span />
          <strong className="tw-display">{t("battleResult.vs")}</strong>
          <span />
        </div>

        <div className="resolve-combatant-row">
          <div className="resolve-hp-block">
            <div>
              <strong className="tw-num">{hp.enemy}%</strong>
              <span>{enemyName}</span>
            </div>
            <HPBar side="enemy" value={hp.enemy} />
          </div>
          <CombatantAvatar
            cp={battle.enemyCP}
            kind={battle.opponentKind}
            name={battle.opponentKind === "player" ? battle.enemyName : undefined}
            nameKey={battle.opponentKind === "npc" ? battle.enemyNameKey : undefined}
          />
        </div>
      </section>

      <section className="resolve-log-panel">
        <div className="resolve-log-panel__head">
          <span>{t("resolve.title")}</span>
          <span>{t("resolve.round", { n: complete ? log.length : shownLines.length })}</span>
        </div>
        <LogFeed lines={shownLines} />
      </section>

      <footer className="resolve-footer">
        {complete ? (
          <Button fullWidth onClick={goResult}>
            {t("resolve.viewResult")}
          </Button>
        ) : (
          <>
            <div className="resolve-speed">
              <span>{t("resolve.speed")}</span>
              <Segmented<BattleSpeed>
                ariaLabel={t("resolve.speed")}
                options={[
                  { value: "normal", labelKey: "settings.speed.normal" },
                  { value: "fast", labelKey: "settings.speed.fast" },
                  { value: "instant", labelKey: "settings.speed.instant" },
                ]}
                value={speed}
                onChange={setSpeed}
              />
            </div>
            <div className="resolve-working">
              <span aria-hidden="true" />
              <strong>{t("resolve.resolving")}</strong>
            </div>
          </>
        )}
      </footer>
    </div>
  );
}

function LogFeed({ lines }: { lines: BattleResolveLogEntry[] }) {
  return (
    <div className="resolve-log-feed tw-scroll">
      {lines.map((line, index) => {
        const mine = line.side === "me";
        const finish = line.key === "resolve.log.finish";
        const crit = line.key === "resolve.log.crit";
        const tone = finish || crit ? "gold" : mine ? "teal" : "crimson";

        return (
          <div
            className={`resolve-log-line resolve-log-line--${tone}`}
            key={`${line.key}-${index}`}
          >
            <span className="tw-num">{index + 1}</span>
            <strong>{mine ? "▲" : "▼"}</strong>
            <p>{t(line.key, line.vars)}</p>
          </div>
        );
      })}
    </div>
  );
}

function deriveHp(lines: BattleResolveLogEntry[], complete: boolean) {
  if (complete) {
    return { my: 64, enemy: 0 };
  }

  return lines.length ? { my: 64, enemy: 22 } : { my: 100, enemy: 100 };
}
