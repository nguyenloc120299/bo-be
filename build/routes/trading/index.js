"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const authentication_1 = __importDefault(require("../../auth/authentication"));
const bet_controller_1 = require("../../controllers/bet.controller");
const tradingRouter = express_1.default.Router();
/*-------------------------------------------------------------------------*/
tradingRouter.use(authentication_1.default);
/*-------------------------------------------------------------------------*/
tradingRouter.post("/bet", bet_controller_1.betController.postBet);
tradingRouter.get("/transactions", bet_controller_1.betController.getTransaction);
exports.default = tradingRouter;
//# sourceMappingURL=index.js.map