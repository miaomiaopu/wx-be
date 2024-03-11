// app.js

import express from "express";
import redis from "redis";
import pinoMiddleware from "./middlewares/pinoMiddleware.js";
import config from "./configs/index.js";
import databasePool from "./configs/database.js";

const app = express();

// 使用 Redis 配置
const redisClient = redis.createClient(config.redis);
redisClient.on("error", (err) => {
  console.error(`Redis error: ${err}`);
});

// 使用 Pino 日志
app.use(pinoMiddleware);

// 使用中间件解析请求体
app.use(express.json());

// 连接数据库
databasePool
  .getConnection()
  .then((conn) => {
    connection = conn;
    config.logger.info("Connected to MariaDB");
  })
  .catch((error) => {
    config.logger.error("Error:", error.message);
  })
  .finally(() => {
    if (connection) {
      connection.release();
    }
  });

// 启动服务器
const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  config.logger.info(`Server is running on port ${PORT}`);
});
