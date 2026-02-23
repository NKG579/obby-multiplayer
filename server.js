const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static("public"));

const players = {};

io.on("connection", (socket) => {
  console.log("Игрок подключился:", socket.id);

  players[socket.id] = { x: 0, y: 2, z: 0 };

  socket.emit("currentPlayers", players);

  socket.broadcast.emit("newPlayer", {
    id: socket.id,
    player: players[socket.id]
  });

  socket.on("updatePosition", (data) => {
    if (players[socket.id]) {
      players[socket.id] = data;
      socket.broadcast.emit("playerMoved", {
        id: socket.id,
        player: data
      });
    }
  });

  // 💬 ЧАТ
  socket.on("chatMessage", (msg) => {
    io.emit("chatMessage", {
      id: socket.id,
      message: msg
    });
  });

  socket.on("disconnect", () => {
    delete players[socket.id];
    io.emit("playerDisconnected", socket.id);
    console.log("Игрок отключился:", socket.id);
  });
});

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log("Сервер запущен");
});
