import express from "express";
import rateLimit from "express-rate-limit";
import { login, getInfo, changeNickname } from "../controllers/userController.js";

const userRouter = express.Router();

// 创建一个限制器，设置最大访问次数和时间间隔
const limiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1小时的时间间隔
  max: 3, // 最大访问次数为3次
  message: '请求过于频繁，请稍后再试。' // 超过限制时返回的错误消息
});

// 创建新用户的路由
userRouter.post("/login", login);
userRouter.get("/getInfo", getInfo);
userRouter.post("/updateNickname", limiter ,changeNickname)

export default userRouter;
