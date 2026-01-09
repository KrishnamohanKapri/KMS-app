// Load environment variables FIRST, before any other imports
const dotenv = require("dotenv");
const path = require("path");
dotenv.config({ path: path.join(__dirname, "config/config.env") }); //load env vars

// Now import other modules AFTER dotenv is configured
const app = require("./app");
const connectDB = require("./config/db");
const http = require("http");
const socket = require("socket.io");
const {addUser, removeUser} = require("./functions/socketFunctions");

//global vars
global.io; 
global.onlineUsers = [];

//server setup
const PORT = process.env.PORT || 8001;

var server = http.createServer(app);
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  connectDB();
});

//socket.io
global.io = socket(server, {
  cors: {
    origin: 'http://localhost:5000',
    credentials: true,
  },
});

global.io.on("connection", (socket) => {
  console.log("connected to socket", socket.id);
  global.io.to(socket.id).emit("reconnect", socket.id);
  socket.on("join", (userId) => {
    addUser(userId, socket.id);
  });
  socket.on("logout", () => {
    removeUser(socket.id);
  });
  socket.on("disconnect", () => {
    removeUser(socket.id);
    console.log("user disconnected", socket.id);
  });
});