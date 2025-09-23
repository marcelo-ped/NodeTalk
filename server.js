const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const path = require("path");
const exphbs = require("express-handlebars");
const { initDb, Message, User } = require("./models");
const authRoutes = require("./routes/auth");

const app = express();
const server = http.createServer(app);

const io = new Server(server);

// Configuração Handlebars
app.engine("hbs", exphbs.engine({ extname: ".hbs" }));
app.set("view engine", "hbs");
app.set("views", path.join(__dirname, "views"));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

// Rotas
app.use("/auth", authRoutes);

app.get("/", (req, res) => {
  res.render("login", { title: "Login" });
});

app.get("/chat", (req, res) => {
  res.render("chat", { title: "Chat App" });
});

// Iniciar DB
initDb();

// WebSockets
io.on("connection", (socket) => {
  console.log("Novo usuário conectado:", socket.id);

  socket.on("joinRoom", (room) => {
    socket.join(room);
    console.log(`Usuário entrou na sala: ${room}`);
  });

  socket.on("message", async (data) => {
    const { room, user, text } = data;
    const foundUser = await User.findOne({ where: { username: user } });
    if (!foundUser) return;

    const newMessage = await Message.create({
      room,
      text,
      userId: foundUser.id,
      timestamp: new Date(),
    });

    io.to(room).emit("message", {
      id: newMessage.id,
      room,
      user: foundUser.username,
      text,
      timestamp: newMessage.timestamp,
    });
  });

  socket.on("disconnect", () => {
    console.log("Usuário desconectado:", socket.id);
  });
});

server.listen(4000, () => {
  console.log("Servidor rodando em http://localhost:4000");
});
