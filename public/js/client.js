const socket = io(); // conecta automaticamente ao backend

const messagesDiv = document.getElementById("messages");
const msgInput = document.getElementById("msgInput");
const sendBtn = document.getElementById("sendBtn");

sendBtn.addEventListener("click", () => {
  const text = msgInput.value.trim();
  if (!text) return;

  socket.emit("message", { user: "Anônimo", text, room: "geral" });
  msgInput.value = "";
});

msgInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") sendBtn.click();
});

socket.on("message", (msg) => {
  const div = document.createElement("div");
  div.classList.add("message");
  div.innerHTML = `<strong>${msg.user}:</strong> ${msg.text}`;
  messagesDiv.appendChild(div);
  messagesDiv.scrollTop = messagesDiv.scrollHeight;
});
