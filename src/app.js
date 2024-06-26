import express from "express";
import cors from "cors";
import cron from "node-cron";
import sequelize from "./configs/database.js";
import logger from "./configs/logger.js";
import userRouter from "./routes/userRoutes.js";
import errorHandler from "./middlewares/errorHandler.js";
import getAccessToken from "./utils/getAccessToken.js";
import redisPool from "./configs/redis.js";
import dataRouter from "./routes/dataRoutes.js";
import informationRouter from "./routes/informationRoutes.js";
import themeRouter from "./routes/themeRoutes.js";

import { fileURLToPath } from "url";
import { dirname, join } from "path";
import cardRouter from "./routes/cardRoutes.js";
import commentRouter from "./routes/commentRoutes.js";
import studyRouter from "./routes/studyRoutes.js";
import setTodayToZero from "./utils/setTodayToZero.js";
import rankingRouter from "./routes/rankingRoutes.js";
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();

// 使用 cors
app.use(cors());

// 测试 RedisPool
redisPool
  .pipeline()
  .set("foo", "bar")
  .get("foo")
  .del("foo")
  .exec((err, results) => {
    if (err) {
      logger.error(`Redis pool error: ${err}`);
    }
  });

// 使用 Pino 日志
// app.use(pinoMiddleware);

// 开放 public
app.use(express.static(join(__dirname, "public")));

// 使用中间件解析请求体
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 用户路由
app.use("/api", userRouter);
// 数据路由
app.use("/api", dataRouter);
// 消息路由
app.use("/api", informationRouter);
// 主题路由
app.use("/api", themeRouter);
// 卡片路由
app.use("/api", cardRouter);
// 评论路由
app.use("/api", commentRouter);
// 学习路由
app.use("/api", studyRouter);
// 排行榜路由
app.use("/api", rankingRouter);

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

getAccessToken();
setTodayToZero();

cron.schedule("59 11 * * *", () => {
  setTodayToZero();
});
