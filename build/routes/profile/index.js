"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const user_controller_1 = require("../../controllers/user.controller");
const authentication_1 = __importDefault(require("../../auth/authentication"));
const profileRouter = express_1.default.Router();
/*-------------------------------------------------------------------------*/
profileRouter.use(authentication_1.default);
/*-------------------------------------------------------------------------*/
<<<<<<< HEAD
profileRouter.post("/recharge", user_controller_1.UserController.postRecharge);
=======
profileRouter.post("/update", user_controller_1.UserController.updateProfile);
profileRouter.post("/recharge", user_controller_1.UserController.postRecharge);
profileRouter.post("/withdrawal", user_controller_1.UserController.postWithdrawal);
>>>>>>> c3630eaac1e1ecdf6b1975c05919bd8f702fdfeb
profileRouter.get("/me", user_controller_1.UserController.getProfile);
profileRouter.get("/me", user_controller_1.UserController.getProfile);
profileRouter.get("/two-fa-key", user_controller_1.UserController.getTwoFaKey);
profileRouter.post("/logout", user_controller_1.UserController.logOut);
exports.default = profileRouter;
//# sourceMappingURL=index.js.map