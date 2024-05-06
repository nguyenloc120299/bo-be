"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const express_1 = __importDefault(require("express"));
const bet_1 = require("./socket/bet");
const cors_1 = __importDefault(require("cors"));
require("./database"); // initialize database
require("./redis");
const routes_1 = __importDefault(require("./routes"));
const socket_server_1 = require("./socket/socket-server");
const bet_2 = require("./helpers/bet");
const app = (0, express_1.default)();
app.use(express_1.default.json({ limit: "10mb" }));
app.use(express_1.default.urlencoded({ limit: "10mb", extended: true, parameterLimit: 50000 }));
app.use((0, cors_1.default)({ origin: "*", optionsSuccessStatus: 200 }));
// Routes
app.use("/api", routes_1.default);
// Socket
const httpServer = require("http").createServer(app);
const io = require("socket.io")(httpServer, {
    cors: {
        origin: "*",
    },
});
io.on("connection", (socket) => {
    (0, socket_server_1.SocketServer)(socket);
});
(0, bet_2.getTradeRate)().then((price) => {
    const bet = new bet_1.Bet(io, price);
    bet.start();
});
exports.default = httpServer;
//# sourceMappingURL=app.js.map