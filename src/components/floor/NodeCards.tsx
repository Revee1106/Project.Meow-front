import { NodeStateBadge, NodeTypeBadge } from "../game/Badges";
import { Button } from "../game/Button";
import { RewardList } from "../game/RewardList";
import { useNodePresentation } from "../game/nodePresentation";
import { t } from "../../i18n/strings";
import type { PlayerState, TowerNode } from "../../services/types";

type NodeCardBaseProps = {
  node: TowerNode;
  playerState: PlayerState;
  playerGarrisonNodeId?: string;
  playerGarrisonNodeName?: string;
  onTap: () => void;
};

export function MajorNodeCard({
  node,
  playerCP,
  playerState,
  playerGarrisonNodeId,
  playerGarrisonNodeName,
  floorNext,
  onTap,
}: NodeCardBaseProps & {
  playerCP: number;
  floorNext?: number;
}) {
  const presentation = useNodePresentation({
    node,
    playerState,
    playerGarrisonNodeId,
    playerGarrisonNodeName,
  });

  return (
    <article
      className={`node-card node-card--major node-card--${presentation.paletteClass}`}
      onClick={onTap}
    >
      <div className="node-card__art">
        <div className="node-card__badges">
          <NodeTypeBadge type="major" />
          <NodeStateBadge
            state={node.state}
            occupierName={node.occupier?.name}
            protectionMin={node.protectionMin}
          />
        </div>
      </div>
      <div className="node-card__body">
        <h2 className="tw-display">{t(node.nameKey)}</h2>
        <p>
          {t("nodeDetail.recommendedCP")}{" "}
          <span className="tw-num">{node.recommendedCP.toLocaleString()}</span>
          <span> / {t("common.you")} </span>
          <span
            className={playerCP >= node.recommendedCP ? "is-good tw-num" : "is-danger tw-num"}
          >
            {playerCP.toLocaleString()}
          </span>
        </p>
        {node.occupier ? (
          <div className="node-card__defender">
            <strong>{node.occupier.name}</strong>
            <span className="tw-num">{node.occupier.cp.toLocaleString()}</span>
          </div>
        ) : null}
        <RewardList rewards={node.rewards} />
        {floorNext ? (
          <div className="node-card__hint">
            {t("floor.unlocksNext", { next: floorNext })}
          </div>
        ) : null}
        <Button
          disabled={presentation.blocked}
          fullWidth
          variant={presentation.buttonVariant}
          onClick={onTap}
        >
          {presentation.actionLabel}
        </Button>
      </div>
    </article>
  );
}

export function MediumNodeCard({
  node,
  playerState,
  playerGarrisonNodeId,
  playerGarrisonNodeName,
  onTap,
}: NodeCardBaseProps) {
  const presentation = useNodePresentation({
    node,
    playerState,
    playerGarrisonNodeId,
    playerGarrisonNodeName,
  });

  return (
    <article
      className={`node-card node-card--medium node-card--${presentation.paletteClass}`}
      onClick={onTap}
    >
      <div className="node-card__top">
        <NodeTypeBadge type="medium" />
        {node.state === "protected" ? <span>{node.protectionMin}m</span> : null}
      </div>
      <h2 className="tw-display">{t(node.nameKey)}</h2>
      <NodeStateBadge
        state={node.state}
        occupierName={node.occupier?.name}
        protectionMin={node.protectionMin}
      />
      <p>
        {t("common.cp")} <span className="tw-num">{node.recommendedCP.toLocaleString()}</span>
      </p>
      {node.occupier ? (
        <div className="node-card__owner">
          {node.occupier.name} / <span className="tw-num">{node.occupier.cp}</span>
        </div>
      ) : null}
      {node.garrison ? (
        <div className="node-card__owner">
          <span className="tw-num">{node.garrison.accumulated.gold}</span>
        </div>
      ) : null}
      <Button
        disabled={presentation.disabled}
        fullWidth
        small
        variant={presentation.buttonVariant}
        onClick={onTap}
      >
        {presentation.actionLabel}
      </Button>
    </article>
  );
}

export function SmallNodeTile({
  node,
  playerState,
  playerGarrisonNodeId,
  playerGarrisonNodeName,
  onTap,
}: NodeCardBaseProps) {
  const presentation = useNodePresentation({
    node,
    playerState,
    playerGarrisonNodeId,
    playerGarrisonNodeName,
  });

  return (
    <button
      className={`small-node small-node--${presentation.paletteClass}`}
      type="button"
      onClick={onTap}
    >
      <span className="small-node__mark" aria-hidden="true" />
      <span>{t(node.shortNameKey ?? node.nameKey)}</span>
      <small>
        {t("common.cp")} <span className="tw-num">{node.recommendedCP}</span>
      </small>
      {presentation.blocked ? <i>{t("common.locked")}</i> : null}
    </button>
  );
}
