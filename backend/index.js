require("dotenv").config();

const express = require("express");
const app = express();
var http = require("http").createServer(app);
var io = require("socket.io")(http);
var path = require("path");

app.use(express.static("dist"));

app.get("/", function (req, res) {
  res.sendFile(path.join(__dirname, "../dist/index.html"));
});

io.on("connection", function (socket) {
  console.log("a user connected");

  socket.on("disconnect", function () {
    console.log("user disconnected");
  });

  socket.on("player:move", function (msg) {
    console.log(msg);
    io.emit("player:move", msg);
  });
});

http.listen(process.argv[2] || 3000, function () {
  console.log(`listening on *:${process.argv[2] || 3000}`);
});
