const express = require("express");
const http = require("http");
const socketIo = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

app.use(express.static("public"));

const players = {};

io.on("connection", (socket) => {

  socket.on("newPlayer", (data) => {
    players[socket.id] = {
      x: 0,
      y: 2,
      z: 0,
      nickname: data.nickname
    };

    socket.emit("currentPlayers", players);
    socket.broadcast.emit("newPlayer", {
      id: socket.id,
      player: players[socket.id]
    });
  });

  socket.on("updatePosition", (data) => {
    if (players[socket.id]) {
      players[socket.id].x = data.x;
      players[socket.id].y = data.y;
      players[socket.id].z = data.z;

      socket.broadcast.emit("playerMoved", {
        id: socket.id,
        player: players[socket.id]
      });
    }
  });

  socket.on("chatMessage", (msg) => {
    io.emit("chatMessage", {
      id: socket.id,
      nickname: players[socket.id]?.nickname || "Player",
      message: msg
    });
  });

  socket.on("disconnect", () => {
    delete players[socket.id];
    io.emit("playerDisconnected", socket.id);
  });
});

server.listen(process.env.PORT || 3000, () => {
  console.log("Сервер запущен");
});
