import express from "express";

import { AuthController } from "../../controllers/auth.contronller";
import { UserController } from "../../controllers/user.controller";

const authRouter = express.Router();

authRouter.post("/register", AuthController.signUp);
authRouter.post("/login", AuthController.signIn);
authRouter.post("/google-login", AuthController.googleLogin);
authRouter.post("/callback-recharge", UserController.callBackRecharge);
export default authRouter;
