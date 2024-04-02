import { Sequelize } from "sequelize";

const sequelize = new Sequelize("wxzk", "root", "wxzk", {
  host: "localhost",
  dialect: "mariadb",
  port: 13306,
  alter: false,
  logging: false,
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
  // 防止 sequelize 修改表结构或者删除表
  sync: {
    alter: false,
    force: false,
  },
});

export default sequelize;
