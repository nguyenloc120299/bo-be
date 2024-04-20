import { Socket } from "socket.io";

const users = [] as any;

const SocketServer = (socket: Socket) => {
  socket.on("joinApp", () => {
    // users.push({
    //   socketId: socket.id,
    // });
    socket.join("MEMBER");
  });
  socket.on("disconnect", () => {
    console.log("User disconnected");
  });
};
export { SocketServer };
