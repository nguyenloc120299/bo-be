import express from "express";
import authentication from "../../auth/authentication";
import { betController } from "../../controllers/bet.controller";

const tradingRouter = express.Router();

/*-------------------------------------------------------------------------*/
tradingRouter.use(authentication);
/*-------------------------------------------------------------------------*/

tradingRouter.post("/bet", betController.postBet);

tradingRouter.get("/transactions", betController.getTransaction);

export default tradingRouter;
