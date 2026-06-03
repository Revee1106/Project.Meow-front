import type { NodeState, PlayerState, TowerNode } from "../../services/types";
import { t } from "../../i18n/strings";

export type DetailVariant = NodeState | "blocked";
export type ButtonVariant = "primary" | "secondary" | "danger" | "ghost";

type NodePresentationInput = {
  node: TowerNode;
  playerState: PlayerState;
  playerGarrisonNodeId?: string;
  playerGarrisonNodeName?: string;
};

export const nodeStatePalette: Record<NodeState, { className: string }> = {
  npcControlled: { className: "npcControlled" },
  available: { className: "available" },
  playerOccupied: { className: "playerOccupied" },
  occupiedByMe: { className: "occupiedByMe" },
  protected: { className: "protected" },
  locked: { className: "locked" },
  cleared: { className: "cleared" },
};

export function getDetailVariant({
  node,
  playerState,
  playerGarrisonNodeId,
}: NodePresentationInput): DetailVariant {
  return isBlockedForPlayer(node, playerState, playerGarrisonNodeId)
    ? "blocked"
    : node.state;
}

export function isBlockedForPlayer(
  node: TowerNode,
  playerState: PlayerState,
  playerGarrisonNodeId?: string,
) {
  return (
    playerState === "garrisoning" &&
    node.id !== playerGarrisonNodeId &&
    node.state !== "occupiedByMe"
  );
}

export function useNodePresentation(input: NodePresentationInput) {
  const { node, playerState, playerGarrisonNodeId, playerGarrisonNodeName } = input;
  const blocked = isBlockedForPlayer(node, playerState, playerGarrisonNodeId);
  const detailVariant = getDetailVariant(input);
  const disabled = blocked || node.state === "protected" || node.state === "locked";

  return {
    blocked,
    detailVariant,
    disabled,
    paletteClass: nodeStatePalette[node.state].className,
    actionLabel: getNodeActionLabel(node, blocked, playerGarrisonNodeName),
    buttonVariant: getNodeButtonVariant(node),
  };
}

export function getNodeActionLabel(
  node: TowerNode,
  blocked: boolean,
  playerGarrisonNodeName?: string,
) {
  if (blocked) {
    return playerGarrisonNodeName
      ? t("blocked.byGarrison", { nodeName: playerGarrisonNodeName })
      : t("common.locked");
  }

  if (node.state === "npcControlled") {
    return t("node.action.challengeNpc");
  }

  if (node.state === "available") {
    return t("node.action.occupy");
  }

  if (node.state === "playerOccupied") {
    return t("node.action.challengePlayer.short");
  }

  if (node.state === "occupiedByMe") {
    return t("node.action.viewGarrison");
  }

  return t("common.locked");
}

export function getNodeButtonVariant(node: TowerNode): ButtonVariant {
  if (node.state === "occupiedByMe") {
    return "secondary";
  }

  if (node.state === "playerOccupied") {
    return "danger";
  }

  if (node.state === "available" || node.state === "npcControlled") {
    return "primary";
  }

  return "ghost";
}
