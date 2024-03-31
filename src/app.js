import express from "express";
import cors from "cors";
import redis from "redis";
import redisConfig from "./configs/redis.js";
import sequelize from "./configs/database.js";
import logger from "./configs/logger.js";
import userRouter from "./routes/userRoutes.js";
import errorHandler from "./middlewares/errorHandler.js";

const app = express();

// 使用 cors
app.use(cors());

// 使用 Redis 配置
const redisClient = redis.createClient(redisConfig);
redisClient.on("error", (err) => {
  console.error(`Redis error: ${err}`);
});

// 使用 Pino 日志
// app.use(pinoMiddleware);

// 使用中间件解析请求体
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 用户路由
app.use("/api", userRouter);

// 统一错误处理
app.use(errorHandler);

// 测试数据库连接
sequelize
  .authenticate()
  .then(() => {
    logger.info("Connect to MariaDB!");
    // 启动服务器
    const PORT = process.env.PORT || 8000;
    app.listen(PORT, () => {
      logger.info(`Server is running on port ${PORT}`);
    });
  })
  .catch((error) => {
    logger.error("Error connect to MariaDB:" + error.message);
  });
