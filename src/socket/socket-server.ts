import { Socket } from "socket.io";

const users = [] as any;

const SocketServer = (socket: Socket) => {
  socket.on("joinApp", () => {
    console.log(socket.id);
    users.push({
      socketId: socket.id,
    });
    socket.join("MEMBER");
  });
  console.log("====================================");
  console.log(users);
  console.log("====================================");
  socket.on("disconnect", () => {
    console.log("User disconnected");
  });
};
export { SocketServer };
