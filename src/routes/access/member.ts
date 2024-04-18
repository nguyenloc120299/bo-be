import express from "express";
import asyncHandler from "../../helpers/asyncHandler";
import { RoleRequest } from "app-request";
import fs from "fs";
import path from "path";
import { SuccessResponse } from "../../core/ApiResponse";

const dataPath = path.join(__dirname, "..", "..", "trade_data.json");

const router = express.Router();

router.get(
  "/trading-data",

  asyncHandler(async (req: RoleRequest, res) => {
    const data = fs.readFileSync(dataPath, "utf8");
    return new SuccessResponse("ok", JSON.parse(data)).send(res);
  })
);

export default router;
