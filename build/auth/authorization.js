"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const ApiError_1 = require("../core/ApiError");
const RoleRepo_1 = __importDefault(require("../database/repository/RoleRepo"));
const asyncHandler_1 = __importDefault(require("../helpers/asyncHandler"));
const router = express_1.default.Router();
exports.default = router.use((0, asyncHandler_1.default)(async (req, res, next) => {
    if (!req.user || !req.user.roles || !req.currentRoleCodes)
        throw new ApiError_1.AuthFailureError("Permission denied");
    const roles = await RoleRepo_1.default.findByCodes(req.currentRoleCodes);
    if (roles.length === 0)
        throw new ApiError_1.AuthFailureError("Permission denied");
    let authorized = false;
    for (const userRole of req.user.roles) {
        if (authorized)
            break;
        for (const role of roles) {
            if (userRole._id.equals(role._id)) {
                authorized = true;
                break;
            }
        }
    }
    if (!authorized)
        throw new ApiError_1.AuthFailureError("Permission denied");
    return next();
}));
//# sourceMappingURL=authorization.js.map