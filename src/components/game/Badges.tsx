import type { NodeState, NodeType } from "../../services/types";
import { t } from "../../i18n/strings";

type NodeStateBadgeProps = {
  state: NodeState;
  occupierName?: string;
  protectionMin?: number;
};

export function NodeStateBadge({
  state,
  occupierName,
  protectionMin,
}: NodeStateBadgeProps) {
  const label =
    state === "playerOccupied"
      ? t("node.state.playerOccupied", { player: occupierName ?? "" })
      : state === "protected"
        ? t("node.state.protected", { time: `${protectionMin ?? 0}m` })
        : t(`node.state.${state}`);

  return <span className={`node-state node-state--${state}`}>{label}</span>;
}

export function NodeTypeBadge({ type }: { type: NodeType }) {
  return <span className={`node-type node-type--${type}`}>{t(`node.type.${type}.short`)}</span>;
}
