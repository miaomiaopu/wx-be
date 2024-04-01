import express from "express";
import { login } from "../controllers/userControllers.js";

const userRouter = express.Router();

// 创建新用户的路由
userRouter.post("/login", login);

export default userRouter;