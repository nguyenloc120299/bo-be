"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SocketServer = void 0;
const users = [];
const SocketServer = (socket) => {
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
exports.SocketServer = SocketServer;
//# sourceMappingURL=socket-server.js.map