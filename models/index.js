const sequelize = require("../db/connection");
const User = require("./User");
const Message = require("./Message");

// Sync do banco
const initDb = async () => {
  try {
    await sequelize.authenticate();
    console.log("Conexão com PostgreSQL bem-sucedida");
    await sequelize.sync({ alter: true }); // cria/atualiza tabelas
    console.log("Modelos sincronizados");
  } catch (err) {
    console.error("Erro ao conectar no PostgreSQL:", err);
  }
};

module.exports = { sequelize, User, Message, initDb };
