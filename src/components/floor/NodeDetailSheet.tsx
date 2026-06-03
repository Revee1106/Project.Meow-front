import type { CSSProperties, PointerEvent, ReactNode } from "react";
import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { NodeStateBadge, NodeTypeBadge } from "../game/Badges";
import { Button } from "../game/Button";
import { getDetailVariant, type DetailVariant } from "../game/nodePresentation";
import { RewardList } from "../game/RewardList";
import { WinChancePill } from "../game/WinChancePill";
import { winChanceBucket } from "../game/winChance";
import { t } from "../../i18n/strings";
import {
  useLeaveGarrisonMutation,
  useOccupyNodeMutation,
} from "../../services/queries";
import type { TowerNode } from "../../services/types";
import { usePlayerStore } from "../../stores/playerStore";
import { useUiStore } from "../../stores/uiStore";
import { rewardMapToList } from "../../utils/rewards";
import { formatMinutes } from "../../utils/time";
import { DEFAULT_GARRISON } from "./floorDerivation";

type NodeDetailSheetProps = {
  node: TowerNode;
  floor: number;
  onClose: () => void;
};

export function NodeDetailSheet({
  node,
  floor,
  onClose,
}: NodeDetailSheetProps) {
  const navigate = useNavigate();
  const player = usePlayerStore((store) => store.player);
  const garrisonNodeNameKey = usePlayerStore(
    (store) => store.garrisonNodeNameKey,
  );
  const garrisonNodeName = t(garrisonNodeNameKey);
  const openConfirm = useUiStore((store) => store.openConfirm);
  const showToast = useUiStore((store) => store.showToast);
  const occupyNode = useOccupyNodeMutation();
  const leaveGarrison = useLeaveGarrisonMutation();
  const dragStartRef = useRef<{ y: number; t: number } | null>(null);
  const [sheetOffset, setSheetOffset] = useState(0);
  const variant = getDetailVariant({
    node,
    playerState: player.state,
    playerGarrisonNodeId: player.garrisonNodeId,
  });
  const bucket = winChanceBucket(player.cp, node.recommendedCP);
  const claimAmount = getClaimAmount(node).toLocaleString();

  const handlePrimary = () => {
    if (variant === "blocked") {
      navigate(
        player.garrisonNodeId
          ? `/garrison?nodeId=${player.garrisonNodeId}`
          : "/garrison",
      );
      return;
    }

    if (variant === "available") {
      occupyNode.mutate(node.id, {
        onSuccess: () => {
          onClose();
          showToast({
            message: t("toast.occupied", { nodeName: t(node.nameKey) }),
          });
        },
      });
      return;
    }

    if (variant === "occupiedByMe") {
      navigate(`/garrison?nodeId=${node.id}`);
      return;
    }

    if (variant === "npcControlled" || variant === "playerOccupied") {
      navigate("/battle/resolve?battleId=victoryNpc");
    }
  };

  const confirmLeave = () => {
    openConfirm({
      title: t("confirm.leaveNode.title"),
      body: t("confirm.leaveNode.body", { nodeName: t(node.nameKey) }),
      confirmLabel: t("node.action.leave"),
      cancelLabel: t("common.cancel"),
      danger: true,
      onConfirm: () => {
        leaveGarrison.mutate(
          { nodeId: node.id, claim: false },
          {
            onSuccess: () => {
              onClose();
              showToast({
                message: t("toast.leftNode", { nodeName: t(node.nameKey) }),
              });
            },
          },
        );
      },
    });
  };

  const handleGrabberPointerDown = (event: PointerEvent<HTMLDivElement>) => {
    dragStartRef.current = { y: event.clientY, t: performance.now() };
    setSheetOffset(0);
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const handleGrabberPointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (!dragStartRef.current) {
      return;
    }

    const delta = Math.max(0, event.clientY - dragStartRef.current.y);
    setSheetOffset(delta);
  };

  const handleGrabberPointerEnd = (event: PointerEvent<HTMLDivElement>) => {
    if (!dragStartRef.current) {
      return;
    }

    const delta = Math.max(0, event.clientY - dragStartRef.current.y);
    const elapsed = Math.max(1, performance.now() - dragStartRef.current.t);
    const velocity = delta / elapsed;
    dragStartRef.current = null;
    event.currentTarget.releasePointerCapture(event.pointerId);

    if (delta > 96 || velocity > 0.8) {
      onClose();
      return;
    }

    setSheetOffset(0);
  };

  return (
    <>
      <button
        className="sheet-scrim"
        type="button"
        aria-label={t("nodeDetail.closeLabel")}
        onClick={onClose}
      />
      <section
        className="node-sheet"
        style={{ "--sheet-offset": `${sheetOffset}px` } as CSSProperties}
        aria-modal="true"
        role="dialog"
      >
        <div
          className="node-sheet__grabber"
          onPointerDown={handleGrabberPointerDown}
          onPointerMove={handleGrabberPointerMove}
          onPointerUp={handleGrabberPointerEnd}
          onPointerCancel={() => {
            dragStartRef.current = null;
            setSheetOffset(0);
          }}
        />
        <header className="node-sheet__header">
          <div>
            <div className="node-sheet__badges">
              <NodeTypeBadge type={node.type} />
              <NodeStateBadge
                state={variant === "blocked" ? node.state : variant}
                occupierName={node.occupier?.name}
                protectionMin={node.protectionMin}
              />
            </div>
            <h2 className="tw-display">{t(node.nameKey)}</h2>
            <p>
              {t(`node.type.${node.type}`)} / {t("floor.title", { floor })}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label={t("nodeDetail.closeLabel")}
          >
            {t("common.closeSymbol")}
          </button>
        </header>

        {variant === "blocked" ? (
          <div className="node-sheet__blocked">
            <strong>
              {t("nodeDetail.blockedTitle", { nodeName: garrisonNodeName })}
            </strong>
            <span>{t("nodeDetail.blockedHint")}</span>
          </div>
        ) : null}

        {variant === "playerOccupied" && node.occupier ? (
          <DefenderBlock node={node} />
        ) : null}

        {variant === "occupiedByMe" ? <GarrisonBlock node={node} /> : null}

        <DetailSection title={t("nodeDetail.recommendedCP")}>
          <StatRow
            label={t("nodeDetail.recommendedCP")}
            value={node.recommendedCP.toLocaleString()}
          />
          <StatRow
            label={t("nodeDetail.yourCP")}
            tone={player.cp >= node.recommendedCP ? "good" : "danger"}
            value={player.cp.toLocaleString()}
          />
          <div className="stat-row">
            <span>{t("nodeDetail.winChance")}</span>
            <WinChancePill bucket={bucket} />
          </div>
        </DetailSection>

        <DetailSection
          title={
            variant === "occupiedByMe"
              ? t("nodeDetail.rewardCap")
              : t("nodeDetail.rewards")
          }
        >
          {variant === "occupiedByMe" ? (
            <p className="node-sheet__copy">
              {t("nodeDetail.rewardCapSentence", {
                hours: node.rewardCapHours,
              })}
            </p>
          ) : null}
          {variant === "playerOccupied" ? (
            <p className="node-sheet__copy">{t("nodeDetail.captureReward")}</p>
          ) : null}
          <RewardList rewards={node.rewards} />
          {variant === "available" ? (
            <p className="node-sheet__copy">
              {t("nodeDetail.availableCap", { hours: node.rewardCapHours })}
            </p>
          ) : null}
        </DetailSection>

        {variant === "playerOccupied" ? (
          <DetailSection title={t("nodeDetail.cost")}>
            <div className="stat-row">
              <span>
                {t("nodeDetail.dailyFree", {
                  used: node.cost?.dailyFreeUsed ?? 0,
                  max: node.cost?.dailyFreeMax ?? 0,
                })}
              </span>
              <strong>{t("nodeDetail.free")}</strong>
            </div>
          </DetailSection>
        ) : null}

        <div className="node-sheet__actions">
          <Button
            fullWidth
            disabled={
              variant === "protected" ||
              variant === "locked" ||
              occupyNode.isPending
            }
            variant={variant === "playerOccupied" ? "danger" : "primary"}
            onClick={handlePrimary}
          >
            {primaryActionLabel(variant, node, claimAmount)}
          </Button>
          {variant === "occupiedByMe" ? (
            <Button fullWidth variant="danger" onClick={confirmLeave}>
              {t("node.action.leave")}
            </Button>
          ) : null}
          <Button fullWidth variant="secondary" onClick={onClose}>
            {t("nodeDetail.cancel")}
          </Button>
        </div>
      </section>
    </>
  );
}

function primaryActionLabel(
  variant: DetailVariant,
  node: TowerNode,
  claimAmount: string,
) {
  if (variant === "blocked") {
    return t("nodeDetail.gotoGarrison");
  }

  if (variant === "available") {
    return t("node.action.occupy");
  }

  if (variant === "playerOccupied") {
    return t("node.action.challengePlayer", {
      player: node.occupier?.name ?? "",
    });
  }

  if (variant === "occupiedByMe") {
    return t("node.action.claimRewards", { amount: claimAmount });
  }

  if (variant === "npcControlled") {
    return t("node.action.challengeNpc");
  }

  return t("common.locked");
}

function DetailSection({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="node-sheet__section">
      <h3>{title}</h3>
      <div className="node-sheet__panel">{children}</div>
    </section>
  );
}

function StatRow({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone?: "good" | "danger";
}) {
  return (
    <div className="stat-row">
      <span>{label}</span>
      <strong className={tone ? `is-${tone}` : undefined}>{value}</strong>
    </div>
  );
}

function DefenderBlock({ node }: { node: TowerNode }) {
  if (!node.occupier) {
    return null;
  }

  return (
    <div className="defender-block">
      <div className="defender-block__avatar">
        {node.occupier.name.slice(0, 1)}
      </div>
      <div>
        <strong>{node.occupier.name}</strong>
        <p>
          {t("nodeDetail.defenderGarrisoned", {
            time: formatMinutes(node.occupier.garrisonedMin),
          })}
          {" / "}
          {t("nodeDetail.defenderDefenses", { count: node.occupier.defenses })}
        </p>
      </div>
      <span className="tw-num">{node.occupier.cp.toLocaleString()}</span>
    </div>
  );
}

function GarrisonBlock({ node }: { node: TowerNode }) {
  const accumulated =
    node.garrison?.accumulated ?? DEFAULT_GARRISON.accumulated;

  return (
    <div className="garrison-block">
      <h3>{t("garrison.accumulated")}</h3>
      <RewardList rewards={rewardMapToList(accumulated)} />
      <p>
        {t("garrison.capIn", {
          time: formatMinutes(
            node.garrison?.capInMin ?? DEFAULT_GARRISON.capInMin,
          ),
        })}
      </p>
    </div>
  );
}

function getClaimAmount(node: TowerNode) {
  return (
    node.garrison?.accumulated.gold ?? DEFAULT_GARRISON.accumulated.gold ?? 0
  );
}
