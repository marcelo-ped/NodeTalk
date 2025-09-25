import express from "express";
import http from "http";
import { Server } from "socket.io";
import { engine } from "express-handlebars";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import { Pool } from "pg";
import authRoutes from "./routes/auth.js";

// Config .env
dotenv.config();

// Config DB (PostgreSQL)
const pool = new Pool({
  host: process.env.DB_HOST || "localhost",
  port: process.env.DB_PORT || 5432,
  user: process.env.DB_USER || "postgres",
  password: process.env.DB_PASS || "postgres",
  database: process.env.DB_NAME || "chatapp",
});

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// __dirname para ESModules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Handlebars
app.engine("hbs", engine({ extname: ".hbs" }));
app.set("view engine", "hbs");
app.set("views", path.join(__dirname, "views"));

// Middlewares
app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// ========================
// Rotas
// ========================
app.use("/", authRoutes(pool)); // passamos o pool pro auth.js

app.get("/", (req, res) => res.redirect("/login"));
app.get("/chat", (req, res) => res.render("chat", { title: "Chat Room" }));

// ========================
// Socket.IO
// ========================
io.on("connection", (socket) => {
  console.log("🔗 Usuário conectado:", socket.id);

  socket.on("message", async (msg) => {
    try {
      await pool.query(
        "INSERT INTO messages (room, username, text) VALUES ($1, $2, $3)",
        [msg.room || "geral", msg.user || "Anônimo", msg.text]
      );
    } catch (err) {
      console.error("Erro ao salvar mensagem:", err);
    }

    io.emit("message", msg);
  });

  socket.on("disconnect", () => {
    console.log("❌ Usuário saiu:", socket.id);
  });
});

// ========================
// Start
// ========================
const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
  console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
});
