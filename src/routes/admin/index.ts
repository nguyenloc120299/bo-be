import express from "express";
import { AdminControllers } from "../../controllers/admin/admin.controller";

const adminRouter = express.Router();

adminRouter.post("/login", AdminControllers.loginAdmin);

adminRouter.get("/users", AdminControllers.getUsers);

export default adminRouter;
