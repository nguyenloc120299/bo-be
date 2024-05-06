import express from "express";
import { UserController } from "../../controllers/user.controller";
import authentication from "../../auth/authentication";

const profileRouter = express.Router();

/*-------------------------------------------------------------------------*/
profileRouter.use(authentication);
/*-------------------------------------------------------------------------*/

profileRouter.post("/recharge", UserController.postRecharge);
profileRouter.get("/me", UserController.getProfile);
profileRouter.post("/logout", UserController.logOut);

export default profileRouter;
