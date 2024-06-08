"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const asyncHandler_1 = __importDefault(require("../../helpers/asyncHandler"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const ApiResponse_1 = require("../../core/ApiResponse");
const redis_1 = require("../../redis");
const cloudinary_1 = __importDefault(require("cloudinary"));
const dataPath = path_1.default.join(__dirname, "..", "..", "trade_data.json");
cloudinary_1.default.v2.config({
    cloud_name: "dqqzhk0pd",
    api_key: "169568384122127",
    api_secret: "jS_bj0t2gG6fJ-ICiL2CV0VdpUM",
});
const multer = require("multer");
const upload = multer({ dest: "uploads/" });
const router = express_1.default.Router();
router.get("/trading-data", (0, asyncHandler_1.default)(async (req, res) => {
    const data = fs_1.default.readFileSync(dataPath, "utf8");
    return new ApiResponse_1.SuccessResponse("ok", JSON.parse(data)).send(res);
}));
router.get("/price-usd", (0, asyncHandler_1.default)(async (req, res) => {
    const data = await (0, redis_1.getValue)("price_usd");
    if (!data)
        return new ApiResponse_1.BadRequestResponse("Có lỗi xảy ra").send(res);
    return new ApiResponse_1.SuccessResponse("ok", parseFloat(data).toFixed(0)).send(res);
}));
router.post("/upload", upload.single("file"), (0, asyncHandler_1.default)(async (req, res) => {
    try {
        const { file } = req;
        const { path } = file;
        const result = await new Promise((resolve, reject) => {
            cloudinary_1.default.v2.uploader.upload(path, { upload_preset: "kyu77xbt", resource_type: "auto" }, (error, result) => {
                if (error)
                    reject(error);
                else
                    resolve(result);
            });
        });
        fs_1.default.unlinkSync(path);
        res.json({ public_id: result.public_id, url: result.secure_url });
    }
    catch (error) {
        console.error(error);
        res.status(400).json({ error: "Failed to upload image" });
    }
}));
exports.default = router;
//# sourceMappingURL=member.js.map