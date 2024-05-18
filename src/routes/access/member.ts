import express from "express";
import asyncHandler from "../../helpers/asyncHandler";
import { RoleRequest } from "app-request";
import fs from "fs";
import path from "path";

import { BadRequestResponse, SuccessResponse } from "../../core/ApiResponse";
import { getValue } from "../../redis";
import cloudinary from "cloudinary";

const dataPath = path.join(__dirname, "..", "..", "trade_data.json");

cloudinary.v2.config({
  cloud_name: "dqqzhk0pd",
  api_key: "169568384122127",
  api_secret: "jS_bj0t2gG6fJ-ICiL2CV0VdpUM",
});

const multer = require("multer");
const upload = multer({ dest: "uploads/" });

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
    const data = await getValue("price_usd");
    if (!data) return new BadRequestResponse("Có lỗi xảy ra").send(res);
    return new SuccessResponse("ok", parseFloat(data).toFixed(2)).send(res);
  })
);

router.post(
  "/upload",
  upload.single("file"),
  asyncHandler(async (req: RoleRequest, res) => {
    try {
      const { file } = req as any;

      const { path } = file;

      const result = await new Promise<any>((resolve, reject) => {
        cloudinary.v2.uploader.upload(
          path,
          { upload_preset: "kyu77xbt", resource_type: "auto" },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );
      });

      fs.unlinkSync(path);

      res.json({ public_id: result.public_id, url: result.secure_url });
    } catch (error) {
      console.error(error);
      res.status(400).json({ error: "Failed to upload image" });
    }
  })
);

export default router;
