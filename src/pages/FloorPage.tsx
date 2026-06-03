import { useEffect, useMemo } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { EmptyState } from "../components/game/EmptyState";
import { QueryErrorState, QueryLoadingState } from "../components/game/QueryState";
import { FloorHeader } from "../components/floor/FloorHeader";
import { FloorSwitcher } from "../components/floor/FloorSwitcher";
import { MajorNodeCard, MediumNodeCard, SmallNodeTile } from "../components/floor/NodeCards";
import { NodeDetailSheet } from "../components/floor/NodeDetailSheet";
import { deriveFloorForPlayer } from "../components/floor/floorDerivation";
import { t } from "../i18n/strings";
import { useFloorQuery, usePlayerProfileQuery } from "../services/queries";
import type { TowerNode } from "../services/types";
import { useFloorStore } from "../stores/floorStore";
import { usePlayerStore } from "../stores/playerStore";

export function FloorPage() {
  const { floorId = "2" } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const player = usePlayerStore((store) => store.player);
  const setPlayer = usePlayerStore((store) => store.setPlayer);
  const garrisonNodeNameKey = usePlayerStore((store) => store.garrisonNodeNameKey);
  const garrisonNodeName = t(garrisonNodeNameKey);
  const setCurrentFloorId = useFloorStore((store) => store.setCurrentFloorId);
  const floorQuery = useFloorQuery(floorId);
  const playerQuery = usePlayerProfileQuery();

  useEffect(() => {
    setCurrentFloorId(floorId);
  }, [floorId, setCurrentFloorId]);

  useEffect(() => {
    if (playerQuery.data) {
      setPlayer(playerQuery.data);
    }
  }, [playerQuery.data, setPlayer]);

  const visibleFloor = useMemo(() => {
    if (!floorQuery.data) {
      return null;
    }

    return deriveFloorForPlayer(floorQuery.data, player.garrisonNodeId);
  }, [floorQuery.data, player.garrisonNodeId]);

  if (floorQuery.isLoading || playerQuery.isLoading) {
    return <QueryLoadingState />;
  }

  if (floorQuery.isError || playerQuery.isError) {
    return (
      <QueryErrorState
        onRetry={() => {
          void floorQuery.refetch();
          void playerQuery.refetch();
        }}
      />
    );
  }

  if (!visibleFloor) {
    return <QueryErrorState onRetry={() => void floorQuery.refetch()} />;
  }

  const selectedNodeId = searchParams.get("node");
  const selectedNode = selectedNodeId
    ? visibleFloor.nodes.find((node) => node.id === selectedNodeId)
    : undefined;
  const majorNode = visibleFloor.nodes.find((node) => node.type === "major");
  const mediumNodes = visibleFloor.nodes.filter((node) => node.type === "medium");
  const smallNodes = visibleFloor.nodes.filter((node) => node.type === "small");

  const openNode = (node: TowerNode) => {
    setSearchParams({ node: node.id });
  };

  const closeNode = () => {
    setSearchParams({});
  };

  return (
    <div className="floor-page">
      <FloorHeader floor={visibleFloor} />

      {majorNode ? (
        <MajorNodeCard
          floorNext={visibleFloor.nextUnlocked ? undefined : visibleFloor.floor + 1}
          node={majorNode}
          playerCP={player.cp}
          playerGarrisonNodeId={player.garrisonNodeId}
          playerGarrisonNodeName={garrisonNodeName}
          playerState={player.state}
          onTap={() => openNode(majorNode)}
        />
      ) : (
        <EmptyState title={t("floor.empty")} />
      )}

      <div className="floor-section-title">{t("floor.medium")}</div>
      <div className="medium-grid">
        {mediumNodes.map((node) => (
          <MediumNodeCard
            key={node.id}
            node={node}
            playerGarrisonNodeId={player.garrisonNodeId}
            playerGarrisonNodeName={garrisonNodeName}
            playerState={player.state}
            onTap={() => openNode(node)}
          />
        ))}
      </div>

      <div className="floor-section-title">{t("floor.small")}</div>
      <div className="small-grid">
        {smallNodes.map((node) => (
          <SmallNodeTile
            key={node.id}
            node={node}
            playerGarrisonNodeId={player.garrisonNodeId}
            playerGarrisonNodeName={garrisonNodeName}
            playerState={player.state}
            onTap={() => openNode(node)}
          />
        ))}
      </div>

      <FloorSwitcher current={visibleFloor.floor} max={visibleFloor.nextUnlocked ? 3 : 2} />

      {selectedNode ? (
        <NodeDetailSheet floor={visibleFloor.floor} node={selectedNode} onClose={closeNode} />
      ) : null}
    </div>
  );
}
