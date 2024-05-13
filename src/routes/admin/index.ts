import express from "express";
import { AdminControllers } from "../../controllers/admin/admin.controller";
import authentication from "../../auth/authentication";
// import authorization from "../../auth/authorization"; 
// import { RoleCode } from "../../database/model/Role";



const adminRouter = express.Router();

adminRouter.post("/login", AdminControllers.loginAdmin);

adminRouter.use(authentication);


adminRouter.get("/users", AdminControllers.getUsers);

adminRouter.delete("/user", AdminControllers.deleteUser);

adminRouter.get("/deposit", AdminControllers.getDeposit);

adminRouter.get("/withdrawl", AdminControllers.getWithdraw);

export default adminRouter;
