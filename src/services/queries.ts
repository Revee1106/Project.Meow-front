import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { t } from "../i18n/strings";
import { queryClient } from "../queryClient";
import { useNotifStore } from "../stores/notifStore";
import { usePlayerStore } from "../stores/playerStore";
import { useUiStore } from "../stores/uiStore";
import { towerApi } from "./api";
import type { GarrisonStateKey, Player, RedDots, ReportsPayload } from "./types";

export const queryKeys = {
  bootstrap: ["bootstrap"] as const,
  player: ["player"] as const,
  floor: (floorId: string | number) => ["floor", String(floorId)] as const,
  reports: ["reports"] as const,
  battle: (battleId: string) => ["battle", battleId] as const,
  battleResolve: (battleId: string) => ["battleResolve", battleId] as const,
  battleResult: (battleId: string) => ["battleResult", battleId] as const,
  garrison: (nodeId: string, state?: string) =>
    ["garrison", nodeId, state ?? "current"] as const,
  equipment: ["equipment"] as const,
};

export function useHomeBootstrapQuery() {
  return useQuery({
    queryKey: queryKeys.bootstrap,
    queryFn: towerApi.fetchBootstrap,
  });
}

export function usePlayerProfileQuery() {
  return useQuery({
    queryKey: queryKeys.player,
    queryFn: towerApi.fetchPlayerProfile,
  });
}

export function useFloorQuery(floorId: string | number) {
  return useQuery({
    queryKey: queryKeys.floor(floorId),
    queryFn: () => towerApi.fetchFloor(floorId),
  });
}

export function useReportsQuery() {
  return useQuery({
    queryKey: queryKeys.reports,
    queryFn: towerApi.fetchReports,
  });
}

export function useEquipmentQuery() {
  return useQuery({
    queryKey: queryKeys.equipment,
    queryFn: towerApi.fetchEquipment,
  });
}

export function useBattleQuery(battleId: string) {
  return useQuery({
    queryKey: queryKeys.battle(battleId),
    queryFn: () => towerApi.fetchBattle(battleId),
  });
}

export function useBattleResolveQuery(battleId: string) {
  return useQuery({
    queryKey: queryKeys.battleResolve(battleId),
    queryFn: () => towerApi.fetchBattleResolve(battleId),
  });
}

export function useBattleResultQuery(battleId: string) {
  return useQuery({
    queryKey: queryKeys.battleResult(battleId),
    queryFn: () => towerApi.fetchBattleResult(battleId),
  });
}

export function useGarrisonQuery(
  nodeId: string,
  opts?: { state?: GarrisonStateKey },
) {
  return useQuery({
    queryKey: queryKeys.garrison(nodeId, opts?.state),
    queryFn: () => towerApi.fetchGarrison(nodeId, opts),
  });
}

export function useChallengeNodeMutation() {
  const queryClient = useQueryClient();
  const setPlayerState = usePlayerStore((store) => store.setPlayerState);

  return useMutation({
    mutationFn: towerApi.challengeNode,
    onMutate: () => {
      const rollback = capturePlayerRollback();
      setPlayerState("battle");
      return rollback;
    },
    onError: (_error, _nodeId, rollback) => {
      rollbackPlayerMutation(rollback);
    },
    onSettled: () => {
      void invalidateCoreQueries(queryClient);
    },
  });
}

export function useOccupyNodeMutation() {
  const queryClient = useQueryClient();
  const setPlayerState = usePlayerStore((store) => store.setPlayerState);
  const setPlayer = usePlayerStore((store) => store.setPlayer);
  const setGarrisonNodeNameKey = usePlayerStore(
    (store) => store.setGarrisonNodeNameKey,
  );

  return useMutation({
    mutationFn: towerApi.occupyNode,
    onMutate: () => {
      const rollback = capturePlayerRollback();
      setPlayerState("battle");
      return rollback;
    },
    onSuccess: ({ player, node }) => {
      setPlayer(player);
      setGarrisonNodeNameKey(node.nameKey);
    },
    onError: (_error, _nodeId, rollback) => {
      rollbackPlayerMutation(rollback);
    },
    onSettled: () => {
      void invalidateCoreQueries(queryClient);
    },
  });
}

export function useOccupyBattleNodeMutation() {
  const queryClient = useQueryClient();
  const setPlayerState = usePlayerStore((store) => store.setPlayerState);

  return useMutation({
    mutationFn: towerApi.occupyBattleNode,
    onSuccess: (_data, variables) => {
      setPlayerState("garrisoning", variables.nodeId);
    },
    onSettled: (_data, _error, variables) => {
      void invalidateCoreQueries(queryClient);
      void queryClient.invalidateQueries({
        queryKey: ["garrison", variables?.nodeId],
      });
    },
  });
}

export function useEquipGearMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: towerApi.equipGear,
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.equipment });
    },
  });
}

export function useMarkReportsReadMutation() {
  const queryClient = useQueryClient();
  const setRedDots = useNotifStore((store) => store.setRedDots);

  return useMutation({
    mutationFn: towerApi.markReportsRead,
    onMutate: () => {
      queryClient.setQueryData<ReportsPayload>(queryKeys.reports, (current) => {
        if (!current || typeof current !== "object" || !("rows" in current)) {
          return current;
        }

        return {
          ...current,
          rows: current.rows.map((row) => ({ ...row, unread: false })),
        };
      });
      setRedDots({ reports: false });
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.reports });
    },
  });
}

export function useClaimGarrisonRewardsMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: towerApi.claimGarrisonRewards,
    onSuccess: (_data, variables) => {
      queryClient.setQueriesData(
        { queryKey: ["garrison", variables.nodeId] },
        (current) => {
          if (!current || typeof current !== "object") {
            return current;
          }

          return { ...current, rewards: [], capPct: 0 };
        },
      );
    },
    onSettled: (_data, _error, variables) => {
      void queryClient.invalidateQueries({
        queryKey: ["garrison", variables?.nodeId],
      });
    },
  });
}

export function useLeaveGarrisonNodeMutation() {
  const queryClient = useQueryClient();
  const leaveNode = usePlayerStore((store) => store.leaveNode);

  return useMutation({
    mutationFn: towerApi.leaveGarrisonNode,
    onSuccess: () => {
      leaveNode();
    },
    onSettled: () => {
      void invalidateCoreQueries(queryClient);
    },
  });
}

export function useClaimGarrisonMutation() {
  const queryClient = useQueryClient();
  const setPlayerState = usePlayerStore((store) => store.setPlayerState);
  const setPlayer = usePlayerStore((store) => store.setPlayer);

  return useMutation({
    mutationFn: towerApi.claimGarrison,
    onMutate: () => {
      const rollback = capturePlayerRollback();
      setPlayerState("battle");
      return rollback;
    },
    onSuccess: ({ player }) => {
      setPlayer(player);
    },
    onError: (_error, _nodeId, rollback) => {
      rollbackPlayerMutation(rollback);
    },
    onSettled: () => {
      void invalidateCoreQueries(queryClient);
    },
  });
}

export function useLeaveGarrisonMutation() {
  const queryClient = useQueryClient();
  const setPlayerState = usePlayerStore((store) => store.setPlayerState);
  const setPlayer = usePlayerStore((store) => store.setPlayer);

  return useMutation({
    mutationFn: ({ nodeId, claim }: { nodeId: string; claim: boolean }) =>
      towerApi.leaveGarrison(nodeId, claim),
    onMutate: () => {
      const rollback = capturePlayerRollback();
      setPlayerState("battle");
      return rollback;
    },
    onSuccess: ({ player }) => {
      setPlayer(player);
    },
    onError: (_error, _variables, rollback) => {
      rollbackPlayerMutation(rollback);
    },
    onSettled: () => {
      void invalidateCoreQueries(queryClient);
    },
  });
}

export function syncClientStores(player: Player, redDots?: RedDots) {
  usePlayerStore.getState().setPlayer(player);

  if (redDots) {
    useNotifStore.getState().setRedDots(redDots);
  }
}

export function invalidateCoreQueries(client = queryClient) {
  return Promise.all([
    client.invalidateQueries({ queryKey: queryKeys.bootstrap }),
    client.invalidateQueries({ queryKey: queryKeys.player }),
    client.invalidateQueries({ queryKey: ["floor"] }),
  ]);
}

type PlayerMutationRollback = {
  player: Player;
  garrisonNodeNameKey: string;
};

function capturePlayerRollback(): PlayerMutationRollback {
  const store = usePlayerStore.getState();

  return {
    player: store.player,
    garrisonNodeNameKey: store.garrisonNodeNameKey,
  };
}

function rollbackPlayerMutation(rollback?: PlayerMutationRollback) {
  if (rollback) {
    usePlayerStore.getState().setPlayer(rollback.player);
    usePlayerStore
      .getState()
      .setGarrisonNodeNameKey(rollback.garrisonNodeNameKey);
  }

  useUiStore.getState().showToast({ message: t("toast.actionFailed") });
}
