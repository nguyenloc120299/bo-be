"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserController = void 0;
const asyncHandler_1 = __importDefault(require("../helpers/asyncHandler"));
const ApiResponse_1 = require("../core/ApiResponse");
const KeystoreRepo_1 = __importDefault(require("../database/repository/KeystoreRepo"));
const UserController = {
    getProfile: (0, asyncHandler_1.default)(async (req, res) => {
        const user = req.user;
        if (!user)
            return new ApiResponse_1.BadRequestResponse("Bạn chưa đăng nhập").send(res);
        return new ApiResponse_1.SuccessResponse("User", user).send(res);
    }),
    logOut: (0, asyncHandler_1.default)(async (req, res) => {
        await KeystoreRepo_1.default.remove(req.keystore._id);
        new ApiResponse_1.SuccessMsgResponse("Logout success").send(res);
    }),
};
exports.UserController = UserController;
//# sourceMappingURL=user.controller.js.map