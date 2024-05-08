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
const dataPath = path_1.default.join(__dirname, "..", "..", "trade_data.json");
const router = express_1.default.Router();
router.get("/trading-data", (0, asyncHandler_1.default)(async (req, res) => {
    const data = fs_1.default.readFileSync(dataPath, "utf8");
    return new ApiResponse_1.SuccessResponse("ok", JSON.parse(data)).send(res);
}));
router.get("/price-usd", (0, asyncHandler_1.default)(async (req, res) => {
    const data = await (0, redis_1.getValue)("price_usd");
    if (!data)
        return new ApiResponse_1.BadRequestResponse('Có lỗi xảy ra').send(res);
    return new ApiResponse_1.SuccessResponse("ok", parseFloat(data).toFixed(2)).send(res);
}));
exports.default = router;
//# sourceMappingURL=member.js.map