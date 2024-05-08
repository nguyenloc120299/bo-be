import express from "express";

import apikey from "../auth/apikey";
import permission from "../helpers/permission";
import member from "./access/member";
import authRouter from "./auth";
import porfileRouter from "./profile";
// import { Permission } from "../database/model/ApiKey";

import profileRouter from "./profile";
import trading from "./trading";
import admin from "./admin";
const router = express.Router();

/*---------------------------------------------------------*/
// router.use(apikey);

// router.use(permission(Permission.GENERAL));

/*---------------------------------------------------------*/
/*---------------------------------------------------------*/

router.use("/member", member);
router.use("/auth", authRouter);
router.use("/profile", profileRouter);
router.use("/trading", trading);
router.use("/admin", admin);
export default router;
