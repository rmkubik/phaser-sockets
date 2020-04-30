require("dotenv").config();

var app = require("express")();
var http = require("http").createServer(app);
var io = require("socket.io")(http);

app.get("/", function (req, res) {
  res.sendFile(__dirname + "/dist/index.html");
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

http.listen(3000, function () {
  console.log("listening on *:3000");
});
