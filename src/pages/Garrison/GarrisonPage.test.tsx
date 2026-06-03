import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderToString } from "react-dom/server";
import { MemoryRouter } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { garrisonFixtures } from "../../mocks/fixtures/garrison";
import { queryKeys } from "../../services/queries";
import type { GarrisonStateKey } from "../../services/types";
import { GarrisonPage } from "./GarrisonPage";

describe("GarrisonPage", () => {
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

  it("renders normal state with claim enabled, 62 percent progress and three defense rows", () => {
    const html = renderGarrison("normal");

    expect(html).toContain("Claim Rewards");
    expect(html).toContain("aria-valuenow=\"62\"");
    expect(html.match(/Defended against/g)?.length).toBe(3);
  });

  it("renders capNear with urgent progress", () => {
    expect(renderGarrison("capNear")).toContain("progress-bar--urgent");
  });

  it("renders capFull with full progress", () => {
    expect(renderGarrison("capFull")).toContain("progress-bar--full");
  });

  it("renders empty state with disabled claim and empty defense log", () => {
    const html = renderGarrison("empty");

    expect(html).toContain("aria-disabled=\"true\"");
    expect(html).toContain("No attacks yet");
  });

  it("renders lost state with return CTA and no leave CTA", () => {
    const html = renderGarrison("lost");

    expect(html).toContain("Node lost");
    expect(html).toContain(">Return<");
    expect(html).not.toContain("Leave Garrison");
  });
});

function renderGarrison(state: GarrisonStateKey) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false, staleTime: Infinity } },
  });
  client.setQueryData(queryKeys.garrison("n_med1", state), garrisonFixtures[state]);

  return renderToString(
    <QueryClientProvider client={client}>
      <MemoryRouter initialEntries={[`/garrison?nodeId=n_med1&state=${state}`]}>
        <GarrisonPage />
      </MemoryRouter>
    </QueryClientProvider>,
  );
}
