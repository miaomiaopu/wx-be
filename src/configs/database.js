// config/database.js

import mariadb from "mariadb";

// 设置数据库，连接池
const pool = mariadb.createPool({
  host: "localhost",
  user: "root",
  password: "wxzk",
  database: "wxzk",
  port: 3306,
  connectionLimit: 5,
});

export default pool;
