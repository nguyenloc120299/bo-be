import express from "express";

import { AuthController } from "../../controllers/auth.contronller";

const authRouter = express.Router();

authRouter.post("/register", AuthController.signUp);
authRouter.post("/login", AuthController.signIn);

export default authRouter;
