const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { User } = require("../models");

const router = express.Router();
const SECRET = "meusegredo";

// Registro
router.post("/register", async (req, res) => {
  const { username, email, password } = req.body;

  const hashed = await bcrypt.hash(password, 10);
  try {
    const user = await User.create({ username, email, password: hashed });
    res.json({ message: "Usuário registrado com sucesso", user });
  } catch (err) {
    res.status(400).json({ error: "Erro ao registrar usuário", details: err });
  }
});

// Login
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ where: { email } });
  if (!user) return res.status(400).json({ error: "Usuário não encontrado" });

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) return res.status(400).json({ error: "Senha incorreta" });

  const token = jwt.sign({ id: user.id }, SECRET, { expiresIn: "1h" });
  res.json({ token, username: user.username });
});

module.exports = router;