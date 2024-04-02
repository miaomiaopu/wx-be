import axios from "axios";
import logger from "../configs/logger.js";
import redisPool from "../configs/redis.js";
import wx from "../configs/wx.js"

const getAccessToken = async () => {
  // 先从 Redis 中获取 access_token
  redisPool.get("access_token", async (err, token) => {
    if (err) {
      logger.error(`Redis error: ${err}`);
      return;
    }
    // 如果 Access token 有效，则返回有效的 token
    if (token) {
      logger.debug(`Access token: ${token}`);
      return token;
    } else {
      // Access token 无效，先获取 token
      const data = {
        grant_type: "client_credential",
        appid: wx.appid,
        secret: wx.appsecret,
        force_refresh: false,
      };

      try {
        const response = await axios.post(
          "https://api.weixin.qq.com/cgi-bin/stable_token",
          data
        );
        const { access_token, expires_in } = response.data;
        logger.debug(`Access token: ${access_token}`);
        logger.debug(`Expires in: ${expires_in}`);

        // 将获取到的 access_token 存入 Redis，并设置过期时间
        redisPool.setex("access_token", expires_in, access_token, (err) => {
          if (err) {
            logger.error(`Redis error: ${err}`);
          }
        });

        return access_token;
      } catch (error) {
        logger.error(`Open api error: ${error.response.data}`);
        return null;
      }
    }
  });
};

export default getAccessToken;
