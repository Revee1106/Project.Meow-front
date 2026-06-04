import cors from "cors";
import express, { type NextFunction, type Request, type Response } from "express";
import { randomUUID } from "node:crypto";
import {
  challengeNode,
  autoEquipGear,
  claimGarrison,
  equipGear,
  getBattleResolve,
  getBattleResult,
  getBootstrap,
  getEquipment,
  getFloor,
  getGarrisonCurrent,
  getNode,
  getPlayer,
  getReports,
  getSettings,
  leaveGarrison,
  markReportRead,
  markReportsRead,
  occupyNode,
  patchSettings,
} from "./data.js";
import { ApiError } from "./errors.js";
import type { ApiErrorResponse } from "./types.js";

declare global {
  namespace Express {
    interface Request {
      requestId: string;
    }
  }
}

export function createApp() {
  const app = express();

  app.use(
    cors({
      origin: [/^http:\/\/localhost:\d+$/, /^http:\/\/127\.0\.0\.1:\d+$/],
    }),
  );
  app.use(express.json());
  app.use(assignRequestId);

  app.get("/api/health", (req, res) => {
    res.json({
      ok: true,
      status: "healthy",
      service: "tower-pvp-api",
      requestId: req.requestId,
    });
  });

  app.get("/api/bootstrap", (_req, res) => {
    res.json(getBootstrap());
  });

  app.get("/api/player/profile", (_req, res) => {
    res.json(getPlayer());
  });

  app.get("/api/floors/:floorId", (req, res, next) => {
    const floorId = Number(req.params.floorId);

    if (!Number.isInteger(floorId)) {
      next(
        new ApiError("VALIDATION_ERROR", "floorId must be an integer", 400, {
          floorId: req.params.floorId,
        }),
      );
      return;
    }

    try {
      res.json(getFloor(floorId));
    } catch (error) {
      if (error instanceof Error && error.message === "FLOOR_NOT_FOUND") {
        next(new ApiError("NODE_NOT_FOUND", "Floor is not configured", 404, { floorId }));
        return;
      }

      next(error);
    }
  });

  app.get("/api/nodes/:nodeId", (req, res, next) => {
    const node = getNode(req.params.nodeId);

    if (!node) {
      next(new ApiError("NODE_NOT_FOUND", "Node is not configured", 404, { nodeId: req.params.nodeId }));
      return;
    }

    if (node.state === "locked") {
      next(new ApiError("NODE_LOCKED", "Node is locked", 423, { nodeId: req.params.nodeId }));
      return;
    }

    res.json(node);
  });

  app.post("/api/tower/challenge", (req, res) => {
    res.json(challengeNode(req.body));
  });

  app.get("/api/battles/:battleId", (req, res) => {
    res.json(getBattleResolve(req.params.battleId));
  });

  app.get("/api/battles/:battleId/result", (req, res) => {
    res.json(getBattleResult(req.params.battleId));
  });

  app.post("/api/strongholds/occupy", (req, res) => {
    res.json(occupyNode(req.body));
  });

  app.get("/api/garrison/current", (req, res) => {
    res.json(getGarrisonCurrent(typeof req.query.nodeId === "string" ? req.query.nodeId : undefined));
  });

  app.post("/api/garrison/claim", (req, res) => {
    res.json(claimGarrison(req.body));
  });

  app.post("/api/garrison/leave", (req, res) => {
    res.json(leaveGarrison(req.body));
  });

  app.get("/api/equipment", (_req, res) => {
    res.json(getEquipment());
  });

  app.post("/api/equipment/equip", (req, res) => {
    res.json(equipGear(req.body));
  });

  app.post("/api/equipment/auto-equip", (req, res) => {
    res.json(autoEquipGear(req.body));
  });

  app.get("/api/reports", (req, res) => {
    res.json(getReports(typeof req.query.filter === "string" ? req.query.filter : undefined));
  });

  app.post("/api/reports/read-all", (_req, res) => {
    res.json(markReportsRead());
  });

  app.post("/api/reports/:reportId/read", (req, res) => {
    res.json(markReportRead(req.params.reportId));
  });

  app.get("/api/settings", (_req, res) => {
    res.json(getSettings());
  });

  app.patch("/api/settings", (req, res) => {
    res.json(patchSettings(req.body));
  });

  app.use((_req, _res, next) => {
    next(new ApiError("NODE_NOT_FOUND", "Route is not implemented", 404));
  });

  app.use(errorHandler);

  return app;
}

function assignRequestId(req: Request, res: Response, next: NextFunction) {
  const requestId = req.header("x-request-id") || randomUUID();
  req.requestId = requestId;
  res.setHeader("x-request-id", requestId);
  next();
}

function errorHandler(error: unknown, req: Request, res: Response, _next: NextFunction) {
  const apiError =
    error instanceof ApiError
      ? error
      : new ApiError("INTERNAL_ERROR", "Internal server error", 500);

  if (!(error instanceof ApiError)) {
    console.error(error);
  }

  const body: ApiErrorResponse = {
    ok: false,
    code: apiError.code,
    message: apiError.message,
    requestId: req.requestId,
  };

  if (apiError.details) {
    body.details = apiError.details;
  }

  res.status(apiError.status).json(body);
}
