"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const member_1 = __importDefault(require("./access/member"));
const auth_1 = __importDefault(require("./auth"));
// import { Permission } from "../database/model/ApiKey";
const profile_1 = __importDefault(require("./profile"));
const trading_1 = __importDefault(require("./trading"));
const admin_1 = __importDefault(require("./admin"));
const router = express_1.default.Router();
/*---------------------------------------------------------*/
// router.use(apikey);
// router.use(permission(Permission.GENERAL));
/*---------------------------------------------------------*/
/*---------------------------------------------------------*/
router.use("/member", member_1.default);
router.use("/auth", auth_1.default);
router.use("/profile", profile_1.default);
router.use("/trading", trading_1.default);
router.use("/admin", admin_1.default);
exports.default = router;
//# sourceMappingURL=index.js.map