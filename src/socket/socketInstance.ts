// socketInstance.ts

import { Server } from "socket.io";
import { SocketServer } from "./socket-server";

let ioInstance: Server | null = null;

export const initializeSocket = (server: any) => {
  ioInstance = new Server(server, {
    cors: {
      origin: "*",
    },
  });

  ioInstance.on("connection", (socket) => {
    console.log("New client connected");

    SocketServer(socket);
  });
};

export const getSocketInstance = () => {
  if (!ioInstance) {
    throw new Error("Socket instance is not initialized");
  }
  return ioInstance;
};
