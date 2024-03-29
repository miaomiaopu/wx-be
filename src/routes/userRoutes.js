import express from "express";
import { createUser } from "../controllers/userControllers.js";

const userRouter = express.Router();

// 创建新用户的路由
userRouter.post("/create-user", createUser);

export default userRouter;