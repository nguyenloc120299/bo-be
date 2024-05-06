import dotenv from "dotenv";

dotenv.config();

import express, { Request, Response, NextFunction } from "express";
import { Bet } from "./socket/bet";
import cors from "cors";
import "./database"; // initialize database
import "./redis";
import initCron from './cron'
import routes from "./routes";
import { Server } from "http";

import { Socket } from "socket.io";
import { SocketServer } from "./socket/socket-server";
import { getTradeRate } from "./helpers/bet";
import bodyParser from "body-parser";

const app = express();

app.use(express.json());

app.use(
  express.urlencoded({ limit: "10mb", extended: true, parameterLimit: 50000 })
);

app.use(cors({ origin: "*", optionsSuccessStatus: 200 }));

// Routes
app.use("/api", routes);


// Socket
const httpServer: Server = require("http").createServer(app);
const io = require("socket.io")(httpServer, {
  cors: {
    origin: "*",
  },
});

io.on("connection", (socket: Socket) => {
  SocketServer(socket);
});

getTradeRate().then((price) => {
  const bet = new Bet(io, price);
  bet.start();
});

initCron()

export default httpServer;
