"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_contronller_1 = require("../../controllers/auth.contronller");
const user_controller_1 = require("../../controllers/user.controller");
const authRouter = express_1.default.Router();
authRouter.post("/register", auth_contronller_1.AuthController.signUp);
authRouter.post("/login", auth_contronller_1.AuthController.signIn);
authRouter.post("/google-login", auth_contronller_1.AuthController.googleLogin);
authRouter.post("/callback-recharge", user_controller_1.UserController.callBackRecharge);
<<<<<<< HEAD
=======
authRouter.post("/verify-otp", auth_contronller_1.AuthController.verifyOtp);
authRouter.post('/send-otp', auth_contronller_1.AuthController.sendOTP);
>>>>>>> c3630eaac1e1ecdf6b1975c05919bd8f702fdfeb
exports.default = authRouter;
//# sourceMappingURL=index.js.map