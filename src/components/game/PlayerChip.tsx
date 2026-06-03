import type { Player } from "../../services/types";
import { t } from "../../i18n/strings";
import { RewardList } from "./RewardList";

type PlayerChipProps = {
  player: Player;
};

export function PlayerChip({ player }: PlayerChipProps) {
  return (
    <div className="player-chip">
      <div className="player-chip__avatar">{player.name.slice(0, 1)}</div>
      <div className="player-chip__main">
        <div className="player-chip__name">{player.name}</div>
        <div className="player-chip__meta">
          {t("common.level")} {player.level} / {t("home.combatPower")}{" "}
          <span className="tw-num">{player.cp.toLocaleString()}</span>
        </div>
      </div>
      <RewardList
        rewards={[
          { type: "gold", amount: player.currencies.gold },
          { type: "fragments", amount: player.currencies.fragments },
        ]}
      />
    </div>
  );
}
