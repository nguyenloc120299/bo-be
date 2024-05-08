import { Socket } from "socket.io";
import { setValue } from "../redis";

const users = [] as any;

const SocketServer = (socket: Socket) => {
  
  socket.on("joinApp", (user: any) => {
    users.push({
      socketId: socket.id,
      user: user?._id,
    });
    
    socket.join("MEMBER");
  });

  socket.on('recharge',(user)=>{
    console.log(1111111111111,user);
    
  })
  socket.on("disconnect", () => {
    const index = users.findIndex((u: any) => u.socketId === socket.id);
    if (index !== -1) {
      users.splice(index, 1);

    }
  });


  
};
export { SocketServer };
