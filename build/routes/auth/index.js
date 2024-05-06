"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_contronller_1 = require("../../controllers/auth.contronller");
const authRouter = express_1.default.Router();
authRouter.post("/register", auth_contronller_1.AuthController.signUp);
authRouter.post("/login", auth_contronller_1.AuthController.signIn);
exports.default = authRouter;
//# sourceMappingURL=index.js.map