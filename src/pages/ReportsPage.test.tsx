import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderToString } from "react-dom/server";
import { MemoryRouter } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { reportsFixture } from "../mocks/fixtures/reports";
import { queryKeys } from "../services/queries";
import { useReportsStore } from "../stores/reportsStore";
import { ReportsPage } from "./ReportsPage";

describe("ReportsPage", () => {
  beforeEach(() => {
    useReportsStore.getState().setFilter("all");
    vi.spyOn(console, "error").mockImplementation((message: unknown) => {
      if (String(message).includes("useLayoutEffect does nothing on the server")) {
        return;
      }

      throw new Error(String(message));
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
    useReportsStore.getState().setFilter("all");
  });

  it("renders report rows with unread count and mark-all CTA", () => {
    const html = renderReports(reportsFixture);

    expect(html).toContain("Reports");
    expect(html).toContain("Mark all read");
    expect(html).toContain("Defense held");
    expect(html).toContain("Node lost");
    expect(html).toContain("4m ago");
  });

  it("filters defense reports", () => {
    const html = renderReports(reportsFixture, "?filter=defense");

    expect(html).toContain("Defense held");
    expect(html).toContain("Node lost");
    expect(html).not.toContain("Raid won");
  });

  it("renders empty state", () => {
    const html = renderReports([]);

    expect(html).toContain("No reports yet");
  });
});

function renderReports(rows = reportsFixture, query = "") {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false, staleTime: Infinity } },
  });
  client.setQueryData(queryKeys.reports, { rows });

  return renderToString(
    <QueryClientProvider client={client}>
      <MemoryRouter initialEntries={[`/reports${query}`]}>
        <ReportsPage />
      </MemoryRouter>
    </QueryClientProvider>,
  );
}
