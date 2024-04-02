import { Data, User } from "../models/index.js";
import logger from "../configs/logger.js";
import axios from "axios";
import wx from "../configs/wx.js";
import generateThirdSession from "../utils/generateThirdSession.js";
import redisPool from "../configs/redis.js";

const getThirdSession = async (third_session, res) => {
  logger.debug(`third_session: ${third_session}`);

  // 判断Redis中 third_session 是否存在，存在用 third_session 直接获取；否则返回 404 错误
  const openid = redisPool.get(third_session, (err) => {
    if (err) {
      logger.error(`Redis error: ${err}`);
    }
  });

  if (!openid) {
    res.status(404).json({ message: "Third session key not found" });
  } else {
    res
      .status(200)
      .json({ message: "Login with third session key successful", third_session: third_session });
  }
};

const getCode = async (code, res) => {
  logger.debug(`code: ${code}`);

  // 用 code 获取openid 和 session_key 的信息
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
    // 抛出异常，让 catch 获取
    throw new Error(`Open api error: ${errcode} - ${errmsg}`);
  }

  logger.debug(`openid: ${openid}`);
  logger.debug(`session_key: ${session_key}`);

  // 生成 third_session
  const third_session = generateThirdSession(openid, session_key);
  logger.debug(`third_session: ${third_session}`);

  // third_session 存入 Redis 中, 设置成 3 天有效
  redisPool.setex(third_session, 259200, openid, (err) => {
    if (err) {
      logger.error(`Redis error: ${err}`);
    }
  });

  // 判断 openid 对应的用户是否存在, 存在则直接返回 third_session；否则先创建用户，再返回 third_session
  let user = await User.findOne({ where: { openid: openid } });
  if (!user) {
    await User.create({ openid: openid, session_key: session_key });
    await Data.create({ openid: openid });
    res
      .status(201)
      .json({ message: "Register successful", third_session: third_session });
  } else {
    // 修改 session_key
    await User.update(
      { session_key: session_key },
      { where: { openid: openid } }
    );
    res
      .status(200)
      .json({ message: "Login successful", third_session: third_session });
  }
};

const login = async (req, res) => {
  try {
    const { third_session, code } = req.body;

    if (third_session) {
      getThirdSession(third_session, res);
    } else {
      getCode(code, res);
    }
  } catch (error) {
    logger.error(`Error login: ${error}`);
    res.status(500).json({ message: "Failed to login" });
  }
};

export { login };
