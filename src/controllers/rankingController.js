import logger from "../configs/logger.js";
import redisPool from "../configs/redis.js";
import { ThemeRanking, UserRanking } from "../models/index.js";

const getUserRanking = async (req, res) => {
  try {
    logger.info("/api/getUserRanking");

    const third_session = req.query.third_session;

    let openid = null;
    await redisPool.get(third_session, (err, result) => {
      if (err) {
        logger.error(`Redis error: ${err}`);
      } else {
        openid = result;
      }
    });

    if (!openid) {
      res.status(404).json({ message: "Third session key not found" });
    } else {
      let ranking = [];

      await UserRanking.findAll({
        order: [["grade", "DESC"]],
        limit: 20,
      }).then((res) => {
        ranking = res;
      });

      res.status(200).json({
        message: "get user ranking successful",
        ranking: ranking,
      });
    }
  } catch (error) {
    logger.error(`Error get user ranking: ${error}`);
    res.status(500).json({ message: "Fail to get user ranking" });
  }
};

const getThemeRanking = async (req, res) => {
  try {
    logger.info("/api/getThemeRanking");

    const third_session = req.query.third_session;

    let openid = null;
    await redisPool.get(third_session, (err, result) => {
      if (err) {
        logger.error(`Redis error: ${err}`);
      } else {
        openid = result;
      }
    });

    if (!openid) {
      res.status(404).json({ message: "Third session key not found" });
    } else {
      let ranking = [];

      await ThemeRanking.findAll({
        order: [["grade", "DESC"]],
        limit: 20,
      }).then((res) => {
        ranking = res;
      });

      res.status(200).json({
        message: "get theme ranking successful",
        ranking: ranking,
      });
    }
  } catch (error) {
    logger.error(`Error get theme ranking: ${error}`);
    res.status(500).json({ message: "Fail to get theme ranking" });
  }
};

export { getUserRanking, getThemeRanking };
