import type { Reward } from "../../services/types";
import { t } from "../../i18n/strings";

type RewardListProps = {
  rewards: Reward[];
};

export function RewardList({ rewards }: RewardListProps) {
  return (
    <div className="reward-list">
      {rewards.map((reward, index) => (
        <RewardChip key={`${reward.type}-${index}`} reward={reward} />
      ))}
    </div>
  );
}

function RewardChip({ reward }: { reward: Reward }) {
  const label =
    reward.type === "gear"
      ? t(`rarity.${reward.rarity ?? "common"}`)
      : (reward.amount ?? 0).toLocaleString();

  return (
    <span className={`reward-chip reward-chip--${reward.type}`}>
      <span className="reward-chip__mark" aria-hidden="true" />
      <span className="tw-num">{label}</span>
    </span>
  );
}
