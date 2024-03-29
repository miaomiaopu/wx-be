import { Sequelize } from "sequelize";

const sequelize = new Sequelize("wxzk", "root", "wxzk", {
  host: "localhost",
  dialect: "mariadb",
  port: 3306,
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
});

export default sequelize;
