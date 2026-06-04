import request from "supertest";
import { describe, expect, it } from "vitest";
import { createApp } from "../app.js";

const app = createApp();

describe.sequential("tower pvp api", () => {
  it("returns health with request id", async () => {
    const res = await request(app).get("/api/health").expect(200);

    expect(res.body.ok).toBe(true);
    expect(res.body.status).toBe("healthy");
    expect(res.body.requestId).toBeTypeOf("string");
  });

  it("returns bootstrap matching the frontend mock identity", async () => {
    const res = await request(app).get("/api/bootstrap").expect(200);

    expect(res.body.player.id).toBe("player_veyra");
    expect(res.body.floor.floor).toBe(2);
    expect(res.body.floor.nodes.some((node: { id: string }) => node.id === "n_med1")).toBe(true);
    expect(res.body.redDots.reports).toBe(2);
  });

  it("returns floor and direct node details", async () => {
    const floor = await request(app).get("/api/floors/2").expect(200);
    const node = await request(app).get("/api/nodes/n_major").expect(200);

    expect(floor.body.nodes.length).toBeGreaterThan(0);
    expect(node.body.id).toBe("n_major");
    expect(node.body.nameKey).toBe("node.f2.lichWarden.name");
  });

  it("returns the unified error response for missing nodes", async () => {
    const res = await request(app).get("/api/nodes/missing-node").expect(404);

    expect(res.body).toMatchObject({
      ok: false,
      code: "NODE_NOT_FOUND",
      message: "Node is not configured",
    });
    expect(res.body.requestId).toBeTypeOf("string");
  });

  it("rejects challenge against a protected node", async () => {
    const res = await request(app)
      .post("/api/tower/challenge")
      .send({ nodeId: "n_s1" })
      .expect(409);

    expect(res.body).toMatchObject({
      ok: false,
      code: "NODE_PROTECTED",
    });
  });

  it("runs the NPC battle, occupy, garrison, claim, and leave loop", async () => {
    const challenge = await request(app)
      .post("/api/tower/challenge")
      .send({ nodeId: "n_s4" })
      .expect(200);

    expect(challenge.body.battleId).toBeTypeOf("string");
    expect(challenge.body.battle.battle.outcome).toBe("victory");
    expect(challenge.body.nextRoute).toContain("/battle/resolve?battleId=");

    const battleId = challenge.body.battleId as string;
    const resolve = await request(app).get(`/api/battles/${battleId}`).expect(200);
    expect(resolve.body.battle.id).toBe(battleId);
    expect(resolve.body.log.length).toBeGreaterThan(0);

    const result = await request(app).get(`/api/battles/${battleId}/result`).expect(200);
    expect(result.body).toMatchObject({
      id: battleId,
      nodeId: "n_s4",
      outcome: "victory",
      canOccupy: true,
    });

    const occupy = await request(app)
      .post("/api/strongholds/occupy")
      .send({ nodeId: "n_s4", battleId })
      .expect(200);

    expect(occupy.body.ok).toBe(true);
    expect(occupy.body.player.state).toBe("garrisoning");
    expect(occupy.body.node.state).toBe("occupiedByMe");
    expect(occupy.body.protectionMin).toBe(5);

    const blocked = await request(app)
      .post("/api/tower/challenge")
      .send({ nodeId: "n_s3" })
      .expect(409);
    expect(blocked.body.code).toBe("PLAYER_GARRISONING");

    const current = await request(app)
      .get("/api/garrison/current?nodeId=n_s4")
      .expect(200);
    expect(current.body.nodeId).toBe("n_s4");
    expect(current.body.rewards.length).toBeGreaterThan(0);

    const goldBefore = occupy.body.player.currencies.gold as number;
    const claim = await request(app)
      .post("/api/garrison/claim")
      .send({ nodeId: "n_s4" })
      .expect(200);
    expect(claim.body.ok).toBe(true);
    expect(claim.body.rewardTokens.length).toBeGreaterThan(0);
    expect(claim.body.player.currencies.gold).toBeGreaterThan(goldBefore);

    const leave = await request(app)
      .post("/api/garrison/leave")
      .send({ nodeId: "n_s4" })
      .expect(200);
    expect(leave.body.ok).toBe(true);
    expect(leave.body.player.state).toBe("free");
  });

  it("settles a basic PVP challenge path", async () => {
    const challenge = await request(app)
      .post("/api/tower/challenge")
      .send({ nodeId: "n_s3" })
      .expect(200);

    expect(challenge.body.result.opponentKind).toBe("player");
    expect(["victory", "defeat"]).toContain(challenge.body.result.outcome);
    expect(challenge.body.pvpCost.freeUsed).toBeGreaterThan(0);
  });

  it("returns equipment and equips backpack gear", async () => {
    const before = await request(app).get("/api/equipment").expect(200);
    const cpBefore = before.body.equipped.weapon.cp as number;

    expect(before.body.backpack.length).toBeGreaterThan(0);
    expect(before.body.capacity).toBe(80);

    const equip = await request(app)
      .post("/api/equipment/equip")
      .send({ gearId: "b6" })
      .expect(200);

    expect(equip.body.ok).toBe(true);
    expect(equip.body.equipped.id).toBe("b6");
    expect(equip.body.replaced.id).toBe("eq_weapon");
    expect(equip.body.player.cp).toBeGreaterThan(1284);
    expect(equip.body.equipment.equipped.weapon.cp).toBeGreaterThan(cpBefore);
  });

  it("auto-equips higher CP gear and handles missing gear", async () => {
    const autoEquip = await request(app)
      .post("/api/equipment/auto-equip")
      .send({ strategy: "cp" })
      .expect(200);

    expect(autoEquip.body.ok).toBe(true);
    expect(Array.isArray(autoEquip.body.changedSlots)).toBe(true);

    const missing = await request(app)
      .post("/api/equipment/equip")
      .send({ gearId: "missing_gear" })
      .expect(404);

    expect(missing.body.code).toBe("GEAR_NOT_FOUND");
  });

  it("lists reports, filters reports, and marks reports read", async () => {
    const all = await request(app).get("/api/reports").expect(200);
    expect(all.body.rows.length).toBeGreaterThan(0);

    const attack = await request(app).get("/api/reports?filter=attack").expect(200);
    expect(
      attack.body.rows.every((row: { kind: string }) =>
        row.kind === "attackWin" || row.kind === "attackLoss",
      ),
    ).toBe(true);

    const reportId = all.body.rows[0].id as string;
    await request(app).post(`/api/reports/${reportId}/read`).expect(200);
    const oneRead = await request(app).get("/api/reports").expect(200);
    expect(oneRead.body.rows.find((row: { id: string }) => row.id === reportId).unread).toBe(false);

    await request(app).post("/api/reports/read-all").expect(200);
    const readAll = await request(app).get("/api/reports").expect(200);
    expect(readAll.body.rows.every((row: { unread: boolean }) => !row.unread)).toBe(true);

    const missing = await request(app).post("/api/reports/missing_report/read").expect(404);
    expect(missing.body.code).toBe("REPORT_NOT_FOUND");
  });

  it("gets and patches settings with validation", async () => {
    const current = await request(app).get("/api/settings").expect(200);
    expect(current.body).toMatchObject({
      locale: "en",
      sfx: true,
      music: false,
      notifications: true,
      battleSpeed: "fast",
    });

    const updated = await request(app)
      .patch("/api/settings")
      .send({ locale: "zh-CN", music: true, battleSpeed: "instant" })
      .expect(200);

    expect(updated.body).toMatchObject({
      locale: "zh-CN",
      music: true,
      battleSpeed: "instant",
    });

    const invalid = await request(app)
      .patch("/api/settings")
      .send({ locale: "zh" })
      .expect(400);

    expect(invalid.body.code).toBe("VALIDATION_ERROR");
  });
});
