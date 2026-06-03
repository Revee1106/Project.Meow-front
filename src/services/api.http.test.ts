import { afterEach, describe, expect, it, vi } from "vitest";

describe("towerApi HTTP mode", () => {
  afterEach(() => {
    vi.resetModules();
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("uses fetch instead of mock fixtures when VITE_USE_MOCKS is false", async () => {
    const fetchMock = stubFetch({ marker: "http" });
    const { towerApi } = await importHttpApi();

    const payload = await towerApi.fetchBootstrap();

    expect(payload).toEqual({ marker: "http" });
    expect(fetchMock).toHaveBeenCalledWith("/api/bootstrap", {
      method: "GET",
      headers: undefined,
      body: undefined,
    });
  });

  it("maps read calls to the backend contract endpoints", async () => {
    const fetchMock = stubFetch({});
    const { towerApi } = await importHttpApi();

    await towerApi.fetchPlayerProfile();
    await towerApi.fetchFloor(2);
    await towerApi.fetchReports();
    await towerApi.fetchBattle("battle_1");
    await towerApi.fetchEquipment();

    expect(fetchMock.mock.calls.map(([path]) => path)).toEqual([
      "/api/player/profile",
      "/api/floors/2",
      "/api/reports",
      "/api/battles/battle_1",
      "/api/equipment",
    ]);
    expect(fetchMock.mock.calls.map(([, init]) => init?.method)).toEqual([
      "GET",
      "GET",
      "GET",
      "GET",
      "GET",
    ]);
  });

  it("maps mutation calls to POST endpoints with JSON bodies", async () => {
    const fetchMock = stubFetch({});
    const { towerApi } = await importHttpApi();

    await towerApi.challengeNode("n_major");
    await towerApi.occupyNode("n_med2");
    await towerApi.claimGarrison("n_med1");
    await towerApi.leaveGarrison("n_med1", false);

    expect(fetchMock.mock.calls.map(([path]) => path)).toEqual([
      "/api/tower/challenge",
      "/api/strongholds/occupy",
      "/api/garrison/claim",
      "/api/garrison/leave",
    ]);
    expect(fetchMock.mock.calls.map(([, init]) => init?.method)).toEqual([
      "POST",
      "POST",
      "POST",
      "POST",
    ]);
    expect(fetchMock.mock.calls.map(([, init]) => init?.headers)).toEqual([
      { "Content-Type": "application/json" },
      { "Content-Type": "application/json" },
      { "Content-Type": "application/json" },
      { "Content-Type": "application/json" },
    ]);
    expect(
      fetchMock.mock.calls.map(([, init]) => parseBody(init?.body)),
    ).toEqual([
      { nodeId: "n_major" },
      { nodeId: "n_med2" },
      { nodeId: "n_med1" },
      { nodeId: "n_med1", claim: false },
    ]);
  });

  it("throws a useful error when the backend returns a non-2xx response", async () => {
    stubFetch({}, 500);
    const { towerApi } = await importHttpApi();

    await expect(towerApi.fetchBootstrap()).rejects.toThrow(
      "GET /api/bootstrap failed: 500",
    );
  });
});

async function importHttpApi() {
  vi.resetModules();
  vi.stubEnv("VITE_USE_MOCKS", "false");

  return import("./api");
}

function stubFetch(payload: unknown, status = 200) {
  const fetchMock = vi.fn<typeof fetch>(async () =>
    Response.json(payload, {
      status,
    }),
  );

  vi.stubGlobal("fetch", fetchMock);

  return fetchMock;
}

function parseBody(body: BodyInit | null | undefined) {
  return typeof body === "string" ? JSON.parse(body) : body;
}
