import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderToStaticMarkup } from "react-dom/server";
import { MemoryRouter } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { Button } from "../components/game/Button";
import { EquipmentPage } from "../pages/EquipmentPage";
import { changeLocale } from "./strings";
import { queryKeys } from "../services/queries";
import type { EquipmentPayload } from "../services/types";

const emptyEquipment: EquipmentPayload = {
  equipped: {
    weapon: null,
    helmet: null,
    armor: null,
    ring: null,
    necklace: null,
    boots: null,
  },
  backpack: [],
  capacity: 80,
};

describe("i18n layout snapshots", () => {
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

  it("keeps a long German Home CTA in the normal button flow", () => {
    expect(
      renderToStaticMarkup(
        <Button fullWidth>
          Belohnungen einsammeln und weiter zur naechsten Ebene
        </Button>,
      ),
    ).toMatchSnapshot();
  });

  it("keeps a Japanese Battle banner in the wrapping banner structure", () => {
    expect(
      renderToStaticMarkup(
        <button className="state-banner state-banner--crimson" type="button">
          <span className="state-banner__glyph" aria-hidden="true">
            B
          </span>
          <span className="state-banner__copy">
            <span className="state-banner__title">フロア3 解放！</span>
            <span className="state-banner__hint">バトル結果を確認できます</span>
          </span>
        </button>,
      ),
    ).toMatchSnapshot();
  });

  it("renders the zh-CN equipment empty state with the app shell text structure", async () => {
    await changeLocale("zh-CN");

    const client = new QueryClient({
      defaultOptions: { queries: { retry: false, staleTime: Infinity } },
    });
    client.setQueryData(queryKeys.equipment, emptyEquipment);

    expect(
      renderToStaticMarkup(
        <QueryClientProvider client={client}>
          <MemoryRouter initialEntries={["/equipment"]}>
            <EquipmentPage />
          </MemoryRouter>
        </QueryClientProvider>,
      ),
    ).toMatchSnapshot();

    await changeLocale("en");
  });
});
