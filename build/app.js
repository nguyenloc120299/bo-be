"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.botTele = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const express_1 = __importDefault(require("express"));
const bet_1 = require("./socket/bet");
const cors_1 = __importDefault(require("cors"));
require("./database"); // initialize database
require("./redis");
const cron_1 = __importDefault(require("./cron"));
const routes_1 = __importDefault(require("./routes"));
const bet_2 = require("./helpers/bet");
const socketInstance_1 = require("./socket/socketInstance");
const node_telegram_bot_api_1 = __importDefault(require("node-telegram-bot-api"));
const config_1 = require("./config");
exports.botTele = new node_telegram_bot_api_1.default(config_1.tokenInfo.apiTokenBotTele, {
    polling: true,
});
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ limit: "10mb", extended: true, parameterLimit: 50000 }));
app.use((0, cors_1.default)({ origin: "*", optionsSuccessStatus: 200 }));
// Routes
app.use("/api", routes_1.default);
const httpServer = require("http").createServer(app);
(0, socketInstance_1.initializeSocket)(httpServer);
(0, bet_2.getTradeRate)().then((price) => {
    const io = (0, socketInstance_1.getSocketInstance)();
    const bet = new bet_1.Bet(io, price);
    bet.start();
});
(0, cron_1.default)();
exports.default = httpServer;
//# sourceMappingURL=app.js.map