import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderToString } from "react-dom/server";
import { MemoryRouter } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { battleFixtures, type BattleResultFixtureKey } from "../../mocks/fixtures/battle";
import { queryKeys } from "../../services/queries";
import { BattleResultPage } from "./BattleResultPage";

describe("BattleResultPage", () => {
  beforeEach(() => {
    vi.spyOn(console, "error").mockImplementation((message: unknown) => {
      if (String(message).includes("useLayoutEffect does nothing on the server")) {
        return;
      }

      throw new Error(String(message));
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("renders victoryNpc with gear drop and equip CTA", () => {
    const html = renderBattle("victoryNpc");

    expect(html).toContain("Equip New Gear");
    expect(html).toContain("+44 CP vs equipped");
    expect(html).toContain("Lichcleaver");
  });

  it("renders victoryNpc without drop and makes occupy primary", () => {
    const html = renderBattle("victoryNpcNoDrop");

    expect(html).toContain("Occupy Node");
    expect(html).toContain("No gear dropped this time");
    expect(html).not.toContain("Equip New Gear");
  });

  it("renders victoryPlayer with raw opponent name and upset highlight", () => {
    const html = renderBattle("victoryPlayer");

    expect(html).toContain("Ardyn");
    expect(html).toContain("Upset win");
  });

  it("renders defeat with retry and no occupy CTA", () => {
    const html = renderBattle("defeat");

    expect(html).toContain("Defeat");
    expect(html).toContain("No rewards, attack failed");
    expect(html).toContain("Try Again");
    expect(html).not.toContain("Occupy Node");
  });
});

function renderBattle(key: BattleResultFixtureKey) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false, staleTime: Infinity } },
  });
  client.setQueryData(queryKeys.battleResult(key), battleFixtures[key]);

  return renderToString(
    <QueryClientProvider client={client}>
      <MemoryRouter initialEntries={[`/battle/result?battleId=${key}`]}>
        <BattleResultPage />
      </MemoryRouter>
    </QueryClientProvider>,
  );
}
