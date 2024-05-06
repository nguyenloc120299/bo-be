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
profileRouter.get("/me", user_controller_1.UserController.getProfile);
profileRouter.post("/logout", user_controller_1.UserController.logOut);
exports.default = profileRouter;
//# sourceMappingURL=index.js.map