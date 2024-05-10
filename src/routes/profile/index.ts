import express from "express";
import { UserController } from "../../controllers/user.controller";
import authentication from "../../auth/authentication";


const profileRouter = express.Router();

/*-------------------------------------------------------------------------*/
profileRouter.use(authentication);
/*-------------------------------------------------------------------------*/

profileRouter.post("/update", UserController.updateProfile);

profileRouter.post("/recharge", UserController.postRecharge);

profileRouter.post("/withdrawal", UserController.postWithdrawal);

profileRouter.get("/me", UserController.getProfile);

profileRouter.get("/me", UserController.getProfile);

profileRouter.get("/two-fa-key", UserController.getTwoFaKey);



profileRouter.post("/logout", UserController.logOut);

export default profileRouter;
