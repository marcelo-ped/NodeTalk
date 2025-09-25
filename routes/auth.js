import express from "express";
import bcrypt from "bcrypt";

export default function (pool) {
  const router = express.Router();

  // Tela de login
  router.get("/login", (req, res) => {
    res.render("login", { title: "Login | Chat App" });
  });

  // POST login
  router.post("/login", async (req, res) => {
    const { email, password } = req.body;
    try {
      const result = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
      if (result.rows.length === 0) {
        return res.render("login", { title: "Login", error: "Usuário não encontrado" });
      }

      const user = result.rows[0];
      const match = await bcrypt.compare(password, user.password);

      if (!match) {
        return res.render("login", { title: "Login", error: "Senha incorreta" });
      }

      res.redirect("/chat");
    } catch (err) {
      console.error("Erro no login:", err);
      res.render("login", { title: "Login", error: "Erro no servidor" });
    }
  });

  // Tela de registro
  router.get("/register", (req, res) => {
    res.render("register", { title: "Registrar | Chat App" });
  });

  // POST registro
  router.post("/register", async (req, res) => {
    const { username, email, password } = req.body;

    try {
      const checkUser = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
      if (checkUser.rows.length > 0) {
        return res.render("register", { title: "Registrar", error: "E-mail já registrado" });
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      await pool.query(
        "INSERT INTO users (username, email, password) VALUES ($1, $2, $3)",
        [username, email, hashedPassword]
      );

      res.redirect("/login");
    } catch (err) {
      console.error("Erro no registro:", err);
      res.render("register", { title: "Registrar", error: "Erro no servidor" });
    }
  });

  return router;
}