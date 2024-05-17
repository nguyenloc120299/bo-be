import express from "express";
import { AdminControllers } from "../../controllers/admin/admin.controller";
import authentication from "../../auth/authentication";
import { UserController } from "../../controllers/user.controller";
// import authorization from "../../auth/authorization";
// import { RoleCode } from "../../database/model/Role";

const adminRouter = express.Router();

adminRouter.post("/login", AdminControllers.loginAdmin);

// ---------------------------------------
adminRouter.use(authentication);
// ---------------------------------------


adminRouter.get("/profile", AdminControllers.getAdmin);

adminRouter.get("/users", AdminControllers.getUsers);

adminRouter.delete("/user", AdminControllers.deleteUser);

adminRouter.get("/deposit", AdminControllers.getDeposit);

adminRouter.get("/withdrawl", AdminControllers.getWithdraw);

adminRouter.get("/statistics-payment", AdminControllers.statisticsDeposit);

adminRouter.post("/handle-withdraw", AdminControllers.handleWithdrawal);

adminRouter.get("/histories-bet", AdminControllers.historyBet);

adminRouter.post("/update-user", AdminControllers.updateUserInfo);

adminRouter.get('/analytic',AdminControllers.getAnalyticData)

adminRouter.post('/update-bet',AdminControllers.updateBet)

adminRouter.get('/dashboard',AdminControllers.dashboarData)

adminRouter.post('/logout',UserController.logOut)

export default adminRouter;
