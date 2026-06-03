import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderToString } from "react-dom/server";
import { MemoryRouter } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { equipmentFixture } from "../mocks/fixtures/equipment";
import { queryKeys } from "../services/queries";
import type { EquipmentPayload } from "../services/types";
import { EquipmentPage } from "./EquipmentPage";

describe("EquipmentPage", () => {
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

  it("renders equipped grid, backpack and better item deltas", () => {
    const html = renderEquipment(equipmentFixture);

    expect(html).toContain("Total Combat Power");
    expect(html).toContain("Warden&#x27;s Maul");
    expect(html).toContain("Lichcleaver");
    expect(html).toContain("44</span>");
    expect(html).toContain("Auto-Equip Best");
  });

  it("renders compare sheet when a gear id is selected", () => {
    const html = renderEquipment(equipmentFixture, "?gear=b1");

    expect(html).toContain("Comparing");
    expect(html).toContain("Replaces Warden&#x27;s Maul");
    expect(html).toContain("CP change");
    expect(html).toContain(">Equip<");
  });

  it("renders empty backpack state", () => {
    const empty: EquipmentPayload = {
      ...equipmentFixture,
      backpack: [],
    };

    const html = renderEquipment(empty);

    expect(html).toContain("Backpack empty");
    expect(html).not.toContain("Lichcleaver");
  });
});

function renderEquipment(data: EquipmentPayload, query = "") {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false, staleTime: Infinity } },
  });
  client.setQueryData(queryKeys.equipment, data);

  return renderToString(
    <QueryClientProvider client={client}>
      <MemoryRouter initialEntries={[`/equipment${query}`]}>
        <EquipmentPage />
      </MemoryRouter>
    </QueryClientProvider>,
  );
}
