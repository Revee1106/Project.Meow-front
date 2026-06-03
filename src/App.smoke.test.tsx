import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderToString } from "react-dom/server";
import { MemoryRouter } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import App from "./App";
import { battleFixtures } from "./mocks/fixtures/battle";
import { equipmentFixture } from "./mocks/fixtures/equipment";
import { garrisonFixtures } from "./mocks/fixtures/garrison";
import { reportsFixture } from "./mocks/fixtures/reports";
import { resolveLog } from "./mocks/fixtures/resolve";
import { floor2, mockPlayer, recentActivity, redDots } from "./mocks/tower";
import { queryKeys } from "./services/queries";
import type { BattleLog } from "./services/types";

const battle: BattleLog = {
  id: "current",
  result: "victory",
  frames: [{ t: 0, actor: "self", dmg: 180 }],
  rewards: [{ type: "gold", amount: 120 }],
};

describe("route smoke tests", () => {
  beforeEach(() => {
    vi.spyOn(console, "error").mockImplementation((message: unknown) => {
      if (
        String(message).includes(
          "Warning: useLayoutEffect does nothing on the server",
        )
      ) {
        return;
      }

      throw new Error(String(message));
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it.each([
    ["/", "Fight the Floor Boss"],
    ["/floor/2?node=n_major", "Lich Warden"],
    ["/equipment", "Lichcleaver"],
    ["/reports", "Mira"],
    ["/settings", "Language"],
    ["/battle/current", "Battle"],
    ["/battle/resolve?battleId=victoryNpc", "Resolving"],
    ["/garrison?nodeId=n_med1", "Crystal Vault"],
    ["/battle/result?battleId=victoryNpc", "Equip New Gear"],
  ])("renders %s", (route, expectedText) => {
    expect(renderRoute(route)).toContain(expectedText);
  });
});

function renderRoute(route: string) {
  const client = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        staleTime: Infinity,
      },
    },
  });

  client.setQueryData(queryKeys.bootstrap, {
    player: mockPlayer,
    floor: { ...floor2, cleared: false },
    redDots,
    activity: recentActivity.free,
  });
  client.setQueryData(queryKeys.player, mockPlayer);
  client.setQueryData(queryKeys.floor("2"), floor2);
  client.setQueryData(queryKeys.equipment, equipmentFixture);
  client.setQueryData(queryKeys.reports, { rows: reportsFixture });
  client.setQueryData(queryKeys.battle("current"), battle);
  client.setQueryData(queryKeys.battleResolve("victoryNpc"), {
    battle: battleFixtures.victoryNpc,
    log: resolveLog,
  });
  client.setQueryData(queryKeys.battleResult("victoryNpc"), battleFixtures.victoryNpc);
  client.setQueryData(
    queryKeys.garrison("n_med1", undefined),
    garrisonFixtures.normal,
  );

  return renderToString(
    <QueryClientProvider client={client}>
      <MemoryRouter initialEntries={[route]}>
        <App />
      </MemoryRouter>
    </QueryClientProvider>,
  );
}
