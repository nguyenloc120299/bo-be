import dotenv from "dotenv";

dotenv.config();

import express, { Request, Response, NextFunction } from "express";
import { Bet } from "./socket/bet";
import cors from "cors";
import "./database"; // initialize database
import "./redis";
import initCron from "./cron";
import routes from "./routes";
import { Server } from "http";

import { getTradeRate } from "./helpers/bet";

import { getSocketInstance, initializeSocket } from "./socket/socketInstance";
import TelegramBot from "node-telegram-bot-api";
import { tokenInfo } from "./config";


export const botTele = new TelegramBot(tokenInfo.apiTokenBotTele, {
  polling: true,
});

const app = express();

app.use(express.json());

app.use(
  express.urlencoded({ limit: "10mb", extended: true, parameterLimit: 50000 })
);

app.use(cors({ origin: "*", optionsSuccessStatus: 200 }));

// Routes
app.use("/api", routes);

const httpServer: Server = require("http").createServer(app);

initializeSocket(httpServer);

getTradeRate().then((price) => {
  const io = getSocketInstance();
  const bet = new Bet(io, price);
  bet.start();
});

initCron();

export default httpServer;
