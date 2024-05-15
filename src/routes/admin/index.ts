import express from "express";
import { AdminControllers } from "../../controllers/admin/admin.controller";
import authentication from "../../auth/authentication";
// import authorization from "../../auth/authorization";
// import { RoleCode } from "../../database/model/Role";

const adminRouter = express.Router();

adminRouter.post("/login", AdminControllers.loginAdmin);

adminRouter.use(authentication);

adminRouter.get("/admin", AdminControllers.getAdmin);

adminRouter.get("/users", AdminControllers.getUsers);

adminRouter.delete("/user", AdminControllers.deleteUser);

adminRouter.get("/deposit", AdminControllers.getDeposit);

adminRouter.get("/withdrawl", AdminControllers.getWithdraw);

adminRouter.get("/statistics-payment", AdminControllers.statisticsDeposit);

adminRouter.post("/handle-withdraw", AdminControllers.handleWithdrawal);

adminRouter.get("/histories-bet", AdminControllers.historyBet);

adminRouter.post("/update-user", AdminControllers.updateUserInfo);

adminRouter.get('/analytic',AdminControllers.getAnalyticData)

export default adminRouter;
