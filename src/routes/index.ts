import express from "express";

import apikey from "../auth/apikey";
import permission from "../helpers/permission";
import signup from "./access/signup";
import member from "./access/member";
import { Permission } from "../database/model/ApiKey";

const router = express.Router();

/*---------------------------------------------------------*/
// router.use(apikey);

// router.use(permission(Permission.GENERAL));

/*---------------------------------------------------------*/
/*---------------------------------------------------------*/

router.use("/signup", signup);

router.use("/member", member);

export default router;
