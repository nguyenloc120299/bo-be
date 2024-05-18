"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.connection = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const config_1 = require("../config");
// Build the connection string
// const dbURI = `mongodb+srv://${db.user}:${db.password}@cluster0.bgzxt.mongodb.net/${db.name}?retryWrites=true&
// w=majority`;
// console.log(dbURI);
const dbURI = `mongodb://${config_1.db.user}:${config_1.db.password}@103.57.220.91:27017/${config_1.db.name}`;
const options = {
    autoIndex: true,
    minPoolSize: config_1.db.minPoolSize,
    maxPoolSize: config_1.db.maxPoolSize,
    connectTimeoutMS: 60000,
    socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
};
function setRunValidators() {
    this.setOptions({ runValidators: true });
}
// Create the database connection
mongoose_1.default
    .plugin((schema) => {
    schema.pre("findOneAndUpdate", setRunValidators);
    schema.pre("updateMany", setRunValidators);
    schema.pre("updateOne", setRunValidators);
    schema.pre("update", setRunValidators);
})
    .connect(dbURI, options)
    .then(() => {
    console.log("Mongoose connection done");
})
    .catch((e) => {
    console.log("Mongoose connection error");
});
// CONNECTION EVENTS
// When successfully connectedping
mongoose_1.default.connection.on("connected", () => {
    console.log("Mongoose connected name: BO");
});
mongoose_1.default.connection.on("error", (err) => {
    console.log("Mongoose default connection error: " + err);
});
// When the connection is disconnected
mongoose_1.default.connection.on("disconnected", () => {
    console.log("Mongoose default connection disconnected");
});
exports.connection = mongoose_1.default.connection;
//# sourceMappingURL=index.js.map