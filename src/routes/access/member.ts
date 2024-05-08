import express from "express";
import asyncHandler from "../../helpers/asyncHandler";
import { RoleRequest } from "app-request";
import fs from "fs";
import path from "path";
import { BadRequestResponse, SuccessResponse } from "../../core/ApiResponse";
import { getValue } from "../../redis";

const dataPath = path.join(__dirname, "..", "..", "trade_data.json");

const router = express.Router();

router.get(
  "/trading-data",

  asyncHandler(async (req: RoleRequest, res) => {
    const data = fs.readFileSync(dataPath, "utf8");
    return new SuccessResponse("ok", JSON.parse(data)).send(res);
  })
);
router.get(
  "/price-usd",
  asyncHandler(async (req: RoleRequest, res) => {
    const data = await getValue("price_usd")
    if(!data) return new BadRequestResponse('Có lỗi xảy ra').send(res)
    return new SuccessResponse("ok", parseFloat(data).toFixed(2)).send(res);
  })
);

export default router;
