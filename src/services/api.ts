import { floor2, mockPlayer, recentActivity, redDots } from "../mocks/tower";
import type {
  BasicOkResponse,
  BattleLog,
  BattleResolvePayload,
  BattleResult,
  BootstrapPayload,
  ClaimResponse,
  EquipmentPayload,
  Floor,
  Garrison,
  GarrisonStateKey,
  LeaveResponse,
  OccupyResponse,
  Player,
  RedDots,
  Report,
  ReportsPayload,
  Reward,
  TowerNode,
} from "./types";

type TowerApi = {
  fetchBootstrap: () => Promise<BootstrapPayload>;
  fetchPlayerProfile: () => Promise<Player>;
  fetchFloor: (floorId: string | number) => Promise<Floor>;
  challengeNode: (nodeId: string) => Promise<BattleLog>;
  occupyNode: (nodeId: string) => Promise<OccupyResponse>;
  claimGarrison: (nodeId: string) => Promise<ClaimResponse>;
  leaveGarrison: (nodeId: string, claim: boolean) => Promise<LeaveResponse>;
  fetchReports: () => Promise<ReportsPayload>;
  fetchBattle: (battleId: string) => Promise<BattleLog>;
  fetchBattleResolve: (battleId: string) => Promise<BattleResolvePayload>;
  fetchBattleResult: (battleId: string) => Promise<BattleResult>;
  occupyBattleNode: (args: {
    nodeId: string;
    battleId: string;
  }) => Promise<{ ok: true; garrisonId: string }>;
  equipGear: (args: { gearId: string }) => Promise<BasicOkResponse>;
  fetchGarrison: (
    nodeId: string,
    opts?: { state?: GarrisonStateKey },
  ) => Promise<Garrison>;
  claimGarrisonRewards: (args: {
    nodeId: string;
  }) => Promise<{ ok: true; rewards: string[] }>;
  leaveGarrisonNode: (args: { nodeId: string }) => Promise<BasicOkResponse>;
  fetchEquipment: () => Promise<EquipmentPayload>;
  markReportsRead: () => Promise<BasicOkResponse>;
};

const USE_MOCKS = import.meta.env.VITE_USE_MOCKS !== "false";

const clone = <T>(value: T): T => structuredClone(value);

const wait = (ms = 120) =>
  new Promise((resolve) => globalThis.setTimeout(resolve, ms));

type MockSession = {
  player: Player;
  floors: Record<string, Floor>;
  redDots: RedDots;
  reports: Report[];
  battles: Record<string, BattleLog>;
  garrisons: Record<string, Garrison>;
  equipment?: EquipmentPayload;
};

const mockSession: MockSession = {
  player: clone(mockPlayer),
  floors: { "2": clone(floor2) },
  redDots: clone(redDots),
  reports: [],
  battles: {},
  garrisons: {},
};

const mockApi: TowerApi = {
  async fetchBootstrap() {
    const floor = getMockFloor(2);

    return {
      player: clone(mockSession.player),
      floor: clone(floor),
      redDots: clone(mockSession.redDots),
      activity: clone(
        mockSession.player.state === "garrisoning"
          ? recentActivity.garrisoning
          : recentActivity.free,
      ),
    };
  },

  async fetchPlayerProfile() {
    return clone(mockSession.player);
  },

  async fetchFloor(floorId) {
    return clone(getMockFloor(floorId));
  },

  async challengeNode(nodeId) {
    mockSession.player = { ...mockSession.player, state: "battle" };
    const node = findMockNode(nodeId);
    const battleId = `battle_${nodeId}`;
    const battle: BattleLog = {
      id: battleId,
      result: "victory",
      frames: [
        { t: 0, actor: "self", dmg: 180 },
        { t: 600, actor: "enemy", dmg: 96 },
        { t: 1200, actor: "self", dmg: 240, crit: true },
      ],
      rewards: node?.rewards ?? [],
      nodeNowAvailable:
        node?.state === "npcControlled" || node?.state === "playerOccupied",
    };

    mockSession.battles[battleId] = battle;
    await wait();
    return clone(battle);
  },

  async occupyNode(nodeId) {
    mockSession.player = { ...mockSession.player, state: "battle" };
    await wait();

    const floor = getMockFloor(2);
    const node = floor.nodes.find((item) => item.id === nodeId);

    if (!node) {
      throw new Error(`Node not found: ${nodeId}`);
    }

    floor.nodes = floor.nodes.map((item) => {
      if (item.state === "occupiedByMe") {
        return { ...item, state: "available", garrison: undefined };
      }

      if (item.id === nodeId) {
        return {
          ...item,
          state: "occupiedByMe",
          garrison: {
            startedMin: 0,
            accumulated: { gold: 0, fragments: 0, stones: 0 },
            capInMin: item.rewardCapHours * 60,
            defenses: 0,
          },
        };
      }

      return item;
    });

    const occupiedNode = floor.nodes.find((item) => item.id === nodeId)!;
    mockSession.player = {
      ...mockSession.player,
      state: "garrisoning",
      garrisonNodeId: nodeId,
    };

    return {
      player: clone(mockSession.player),
      node: clone(occupiedNode),
    };
  },

  async claimGarrison(nodeId) {
    mockSession.player = { ...mockSession.player, state: "battle" };
    await wait();

    const node = findMockNode(nodeId);
    const accumulated = node?.garrison?.accumulated ?? {};
    const rewards = Object.entries(accumulated).map(([type, amount]) => ({
      type: type as Reward["type"],
      amount,
    }));

    mockSession.player = {
      ...mockSession.player,
      state: "garrisoning",
      currencies: {
        ...mockSession.player.currencies,
        gold: mockSession.player.currencies.gold + (accumulated.gold ?? 0),
        stones:
          mockSession.player.currencies.stones + (accumulated.stones ?? 0),
        fragments:
          mockSession.player.currencies.fragments +
          (accumulated.fragments ?? 0),
      },
    };

    if (node?.garrison) {
      node.garrison = {
        ...node.garrison,
        accumulated: { gold: 0, fragments: 0, stones: 0 },
      };
    }

    return {
      rewards,
      player: clone(mockSession.player),
    };
  },

  async leaveGarrison(nodeId, claim) {
    mockSession.player = { ...mockSession.player, state: "battle" };
    await wait();

    if (claim) {
      await mockApi.claimGarrison(nodeId);
    }

    const floor = getMockFloor(2);
    floor.nodes = floor.nodes.map((node) =>
      node.id === nodeId
        ? { ...node, state: "available", garrison: undefined }
        : node,
    );
    mockSession.player = {
      ...mockSession.player,
      state: "free",
      garrisonNodeId: undefined,
    };

    return { player: clone(mockSession.player) };
  },

  async fetchReports() {
    if (!mockSession.reports.length) {
      mockSession.reports = clone(await getReportsFixtureMock());
    }

    await wait(150);
    return { rows: clone(mockSession.reports) };
  },

  async fetchBattle(battleId) {
    return (
      clone(mockSession.battles[battleId]) ?? {
        id: battleId,
        result: "victory",
        frames: [],
        rewards: [],
      }
    );
  },

  async fetchBattleResolve(battleId) {
    await wait(150);
    return {
      battle: clone(await getBattleResultFixtureMock(battleId)),
      log: clone(await getResolveLogFixtureMock()),
    };
  },

  async fetchBattleResult(battleId) {
    await wait(150);
    return clone(await getBattleResultFixtureMock(battleId));
  },

  async occupyBattleNode({ nodeId, battleId }) {
    await mockApi.occupyNode(nodeId);
    mockSession.garrisons[nodeId] = clone(await getGarrisonFixtureMock("normal"));
    await wait(150);
    return { ok: true, garrisonId: `garrison_${battleId}` };
  },

  async equipGear({ gearId }) {
    await wait(150);
    const equipment = await getMockEquipmentSession();
    const candidate = equipment.backpack.find((gear) => gear.id === gearId);

    if (candidate) {
      const previous = equipment.equipped[candidate.slot];
      equipment.equipped[candidate.slot] = candidate;
      equipment.backpack = [
        ...equipment.backpack.filter((gear) => gear.id !== gearId),
        ...(previous ? [previous] : []),
      ];
    }

    return { ok: true };
  },

  async fetchGarrison(nodeId, opts) {
    await wait(150);
    const reviewState = import.meta.env.DEV ? opts?.state : undefined;
    const fixture = reviewState
      ? await getGarrisonFixtureMock(reviewState)
      : undefined;

    if (fixture) {
      mockSession.garrisons[nodeId] = clone(fixture);
      return clone(fixture);
    }

    return clone(
      mockSession.garrisons[nodeId] ?? (await getGarrisonFixtureMock("normal")),
    );
  },

  async claimGarrisonRewards({ nodeId }) {
    await wait(150);
    const garrison =
      mockSession.garrisons[nodeId] ??
      clone(await getGarrisonFixtureMock("normal"));
    const rewards = clone(garrison.rewards);
    mockSession.garrisons[nodeId] = {
      ...garrison,
      rewards: [],
      capPct: 0,
      capInLabel: `${garrison.capHours}h 0m`,
      capFull: false,
      capUrgent: false,
    };

    return { ok: true, rewards };
  },

  async leaveGarrisonNode({ nodeId }) {
    await mockApi.leaveGarrison(nodeId, false);
    delete mockSession.garrisons[nodeId];
    await wait(150);
    return { ok: true };
  },

  async fetchEquipment() {
    await wait(150);
    return clone(await getMockEquipmentSession());
  },

  async markReportsRead() {
    await wait(150);
    if (!mockSession.reports.length) {
      mockSession.reports = clone(await getReportsFixtureMock());
    }

    mockSession.reports = mockSession.reports.map((report) => ({
      ...report,
      unread: false,
    }));
    mockSession.redDots = { ...mockSession.redDots, reports: false };

    return { ok: true };
  },
};

const httpApi: TowerApi = {
  fetchBootstrap: () => request("/api/bootstrap"),
  fetchPlayerProfile: () => request("/api/player/profile"),
  fetchFloor: (floorId) => request(`/api/floors/${floorId}`),
  challengeNode: (nodeId) =>
    request("/api/tower/challenge", { method: "POST", body: { nodeId } }),
  occupyNode: (nodeId) =>
    request("/api/strongholds/occupy", { method: "POST", body: { nodeId } }),
  claimGarrison: (nodeId) =>
    request("/api/garrison/claim", { method: "POST", body: { nodeId } }),
  leaveGarrison: (nodeId, claim) =>
    request("/api/garrison/leave", { method: "POST", body: { nodeId, claim } }),
  fetchReports: () => request("/api/reports"),
  fetchBattle: (battleId) => request(`/api/battles/${battleId}`),
  fetchBattleResolve: () => notImplemented("fetchBattleResolve"),
  fetchBattleResult: () => notImplemented("fetchBattleResult"),
  occupyBattleNode: () => notImplemented("occupyBattleNode"),
  equipGear: () => notImplemented("equipGear"),
  fetchGarrison: () => notImplemented("fetchGarrison"),
  claimGarrisonRewards: () => notImplemented("claimGarrisonRewards"),
  leaveGarrisonNode: () => notImplemented("leaveGarrisonNode"),
  fetchEquipment: () => request("/api/equipment"),
  markReportsRead: () => notImplemented("markReportsRead"),
};

export const towerApi = USE_MOCKS ? mockApi : httpApi;

async function request<T>(
  path: string,
  options: { method?: string; body?: unknown } = {},
): Promise<T> {
  const response = await fetch(path, {
    method: options.method ?? "GET",
    headers: options.body ? { "Content-Type": "application/json" } : undefined,
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  if (!response.ok) {
    throw new Error(
      `${options.method ?? "GET"} ${path} failed: ${response.status}`,
    );
  }

  return response.json() as Promise<T>;
}

function getMockFloor(floorId: string | number): Floor {
  const key = String(floorId);
  const floor = mockSession.floors[key];

  if (floor) {
    return floor;
  }

  return {
    ...clone(floor2),
    floor: Number(floorId),
    nameKey: `floor.f${floorId}.name`,
    ruleKey: `floor.f${floorId}.rule`,
    nodes: [],
  };
}

function findMockNode(nodeId: string): TowerNode | undefined {
  return Object.values(mockSession.floors)
    .flatMap((floor) => floor.nodes)
    .find((node) => node.id === nodeId);
}

function notImplemented(method: string): never {
  throw new Error(`${method} is not implemented without VITE_USE_MOCKS=true`);
}

async function getBattleResultFixtureMock(battleId: string) {
  const { getBattleResultFixture } = await import("../mocks/fixtures/battle");
  return getBattleResultFixture(battleId);
}

async function getGarrisonFixtureMock(state?: string) {
  const { getGarrisonFixture } = await import("../mocks/fixtures/garrison");
  return getGarrisonFixture(state);
}

async function getResolveLogFixtureMock() {
  const { resolveLog } = await import("../mocks/fixtures/resolve");
  return resolveLog;
}

async function getEquipmentFixtureMock() {
  const { equipmentFixture } = await import("../mocks/fixtures/equipment");
  return equipmentFixture;
}

async function getReportsFixtureMock() {
  const { reportsFixture } = await import("../mocks/fixtures/reports");
  return reportsFixture;
}

async function getMockEquipmentSession() {
  if (!mockSession.equipment) {
    mockSession.equipment = clone(await getEquipmentFixtureMock());
  }

  return mockSession.equipment;
}
