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

profileRouter.get("/dashboard", UserController.getDashboard);

profileRouter.get("/two-fa-key", UserController.getTwoFaKey);

profileRouter.post("/kyc-profile", UserController.postKycProfile);

profileRouter.get("/analysics/ref", UserController.getAnalysisRef);

profileRouter.post("/logout", UserController.logOut);

export default profileRouter;
