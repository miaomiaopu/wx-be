import User from "../models/User.js";
import logger from "../configs/logger.js";
import axios from "axios";
import wx from "../configs/wx.js";

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
    logger.info(`code: ${code}`);
    // 用 code 获取信息
    const params = {
      appid: wx.appid,
      secret: wx.appsecret,
      js_code: code,
      grant_type: "authorization_code",
    };

    const response = await axios.get(
      "https://api.weixin.qq.com/sns/jscode2session",
      { params: params }
    );
    const { openid, session_key, errcode, errmsg } = response.data;

    if (errcode) {
      // 抛出异常，让catch 获取
      throw new Error(`Open api error: ${errcode} - ${errmsg}`);
    }

    logger.info(`openid: ${openid}`);
    logger.info(`session_key: ${session_key}`);
    res.status(200).json({ message: "Login successful" });
  } catch (error) {
    logger.error(`Error login: ${error}`);
    res.status(500).json({ message: "Failed to login" });
  }
};

export { login };
