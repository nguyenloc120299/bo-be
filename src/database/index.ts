import mongoose from "mongoose";
import { db } from "../config";

// Build the connection string
const dbURI = `mongodb+srv://${db.user}:${db.password}@cluster0.bgzxt.mongodb.net/${db.name}?retryWrites=true&
w=majority`;
console.log(dbURI);

const options = {
  autoIndex: true,
  minPoolSize: db.minPoolSize, // Maintain up to x socket connections
  maxPoolSize: db.maxPoolSize, // Maintain up to x socket connections
  connectTimeoutMS: 60000, // Give up initial connection after 10 seconds
  socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
};

function setRunValidators() {
  this.setOptions({ runValidators: true });
}

// Create the database connection
mongoose
  .plugin((schema: any) => {
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
mongoose.connection.on("connected", () => {
  console.log("Mongoose connected name: BO");
});

mongoose.connection.on("error", (err) => {
  console.log("Mongoose default connection error: " + err);
});

// When the connection is disconnected
mongoose.connection.on("disconnected", () => {
  console.log("Mongoose default connection disconnected");
});

export const connection = mongoose.connection;
