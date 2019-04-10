const express = require("express");
const http = require("http");
const socketIO = require("socket.io");
const { setup } = require('radiks-server');

// our localhost port
const port = process.env.REACT_APP_SERVER || 5000;

require('dotenv').config()
const mongo = process.env.MONGO_URI_DEV;

const app = express();

setup({
  mongoDBUrl: mongo
}).then((RadiksController) => {
  app.use('/radiks', RadiksController);
});

// our server instance
const server = http.createServer(app);

// This creates our socket using the instance of the server
const io = socketIO(server);

// This is what the socket.io syntax is like, we will work this later
io.on("connection", socket => {
  console.log("User connected");
  socket.on("room", room => {
    socket.leave(socket.room);
    socket.join(room);
    // roomName = room;
    socket.on("update content", content => {
      // console.log(content);
      // once we get a 'update content' event from one of our clients, we will send it to the rest of the clients
      // we make use of the socket.emit method again with the argument given to use from the callback function above
      console.log("Updating content...");
      try {
        io.sockets.in(room).emit("update content", content);
      } catch (e) {
        console.log(e);
      }
    });
  });

  // console.log(io.nsps['/'].adapter.rooms)

  socket.on("disconnect", () => {
    console.log("user disconnected");
  });
});

server.listen(process.env.PORT || 5000, () => console.log(`Listening on port ${port}`));
