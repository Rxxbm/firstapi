const Sequelize = require("sequelize");
const connection = new Sequelize("games", "root", "", {
  hostname: "localhost",
  dialect: "mysql",
  logging: false,
  timezone: "-03:00",
});

module.exports = connection;
