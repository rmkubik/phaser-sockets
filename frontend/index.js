import io from "socket.io-client";

const socket = io("http://localhost:3000");

document.querySelector("form").addEventListener("submit", (e) => {
  e.preventDefault();

  socket.emit("chat message", document.querySelector("#m").value);

  document.querySelector("#m").value = "";

  return false;
});

socket.on("chat message", function (msg) {
  const li = document.createElement("li");
  li.innerText = msg;
  document.querySelector("#messages").appendChild(li);
});
