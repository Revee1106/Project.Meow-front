import { useParams } from "react-router-dom";
import { EmptyState } from "../components/game/EmptyState";
import {
  QueryErrorState,
  QueryLoadingState,
} from "../components/game/QueryState";
import { RewardList } from "../components/game/RewardList";
import { t } from "../i18n/strings";
import { useBattleQuery } from "../services/queries";

export function BattlePage() {
  const { battleId = "current" } = useParams();
  const battleQuery = useBattleQuery(battleId);

  if (battleQuery.isLoading) {
    return <QueryLoadingState />;
  }

  if (battleQuery.isError) {
    return <QueryErrorState onRetry={() => void battleQuery.refetch()} />;
  }

  const battle = battleQuery.data;

  if (!battle || !battle.frames.length) {
    return (
      <EmptyState
        title={t("route.battle.title")}
        body={t("route.battle.empty")}
      />
    );
  }

  return (
    <section className="route-stub">
      <p className="route-stub__eyebrow">
        {t(`battle.result.${battle.result}`)}
      </p>
      <h1 className="tw-display route-stub__title">
        {t("route.battle.title")}
      </h1>
      <RewardList rewards={battle.rewards} />
    </section>
  );
}
