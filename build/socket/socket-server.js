"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SocketServer = void 0;
const users = [];
const SocketServer = (socket) => {
    socket.on("joinApp", (user) => {
        users.push({
            socketId: socket.id,
            user: user === null || user === void 0 ? void 0 : user._id,
        });
        socket.join("MEMBER");
    });
    socket.on('recharge', (user) => {
        console.log(1111111111111, user);
    });
    socket.on("disconnect", () => {
        const index = users.findIndex((u) => u.socketId === socket.id);
        if (index !== -1) {
            users.splice(index, 1);
        }
    });
};
exports.SocketServer = SocketServer;
//# sourceMappingURL=socket-server.js.map