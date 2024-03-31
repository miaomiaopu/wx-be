import User from "../models/User.js";
import logger from "../configs/logger.js";

// const createUser = async (req, res) => {
//   try {
//     // 从请求体中获取用户信息
//     const { openid, session_key, phone_number, nickname } = req.body;

//     // 创建新用户记录
//     const newUser = await User.create({
//       openid,
//       session_key,
//       phone_number,
//       nickname,
//     });

//     // 返回新创建的用户信息
//     res.status(201).json(newUser);
//   } catch (error) {
//     // 处理错误情况
//     logger.error("Error creating user:", error);
//     res.status(500).json({ message: "Failed to create user" });
//   }
// };

const login = async (req, res) => {
  try {
    const { code } = req.body;
    logger.info("code:" + code);
    res.status(200).json({ message: "Login successful" });
  } catch (error) {
    logger.error("Error login:" + error);
    res.status(500).json({ message: "Failed to login" });
  }
};

export { login };
