const { Sequelize } = require("sequelize");

// Conexão com PostgreSQL
const sequelize = new Sequelize("chatdb", "postgres", "sua_senha", {
  host: "localhost",
  dialect: "postgres",
  logging: false
});

module.exports = sequelize;