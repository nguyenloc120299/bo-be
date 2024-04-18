import dotenv from "dotenv";
dotenv.config();

import express, { Request, Response, NextFunction } from "express";
import { Bet } from "./socket/bet";
import cors from "cors";
import "./database"; // initialize database
import routes from "./routes";
import { Server } from "http";
import { Socket } from "socket.io";
import { SocketServer } from "./socket/socket-server";

const app = express();

app.use(express.json({ limit: "10mb" }));
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

const bet = new Bet(io, 6000);
bet.start();

export default httpServer;
