import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderToString } from "react-dom/server";
import { MemoryRouter } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { battleFixtures } from "../../mocks/fixtures/battle";
import { resolveLog } from "../../mocks/fixtures/resolve";
import { queryKeys } from "../../services/queries";
import { BattleResolvePage } from "./BattleResolvePage";

describe("BattleResolvePage", () => {
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

  it("renders resolving state with visible log lines, HP bars, skip, and speed control", () => {
    const html = renderResolve();

    expect(html).toContain("Round 3");
    expect(html).toContain("Skip");
    expect(html).toContain("Speed");
    expect(html).toContain("Critical hit!");
    expect(html).toContain("aria-valuenow=\"64\"");
    expect(html).toContain("aria-valuenow=\"22\"");
  });

  it("renders complete state with all log lines and view result CTA", () => {
    const html = renderResolve("complete");

    expect(html).toContain("Enemy defeated!");
    expect(html).toContain("View Result");
    expect(html).toContain("aria-valuenow=\"0\"");
    expect(html).not.toContain(">Skip<");
  });
});

function renderResolve(phase?: "complete") {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false, staleTime: Infinity } },
  });
  client.setQueryData(queryKeys.battleResolve("victoryNpc"), {
    battle: battleFixtures.victoryNpc,
    log: resolveLog,
  });

  const route = phase
    ? `/battle/resolve?battleId=victoryNpc&phase=${phase}`
    : "/battle/resolve?battleId=victoryNpc";

  return renderToString(
    <QueryClientProvider client={client}>
      <MemoryRouter initialEntries={[route]}>
        <BattleResolvePage />
      </MemoryRouter>
    </QueryClientProvider>,
  );
}
