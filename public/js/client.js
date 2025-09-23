const socket = io("http://localhost:4000");
const messagesBox = document.getElementById("messages");
const messageInput = document.getElementById("messageInput");
const sendBtn = document.getElementById("sendBtn");

// Usuário fake só pra exemplo (pegando da URL query)
const urlParams = new URLSearchParams(window.location.search);
const username = urlParams.get("username") || "Anon";

const room = "geral";
socket.emit("joinRoom", room);

// Recebe mensagens
socket.on("message", (msg) => {
  const div = document.createElement("div");
  div.classList.add("message");
  if (msg.user === username) div.classList.add("me");
  div.innerHTML = `<strong>${msg.user}:</strong> ${msg.text}`;
  messagesBox.appendChild(div);
  messagesBox.scrollTop = messagesBox.scrollHeight;
});

// Envia mensagem
sendBtn.addEventListener("click", () => {
  const text = messageInput.value;
  if (text.trim()) {
    socket.emit("message", { room, user: username, text });
    messageInput.value = "";
  }
});

messageInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") sendBtn.click();
});
