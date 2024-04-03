import logger from "../configs/logger.js";
import redisPool from "../configs/redis.js";
import { Data } from "../models/index.js";

// 用前端的 third_session
const getDataListWithThirdSession = async (req, res) => {
  try {
    const third_session = req.query.third_session;
    logger.debug(`third_session: ${third_session}`);

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
      logger.debug(`openid: ${openid}`);
      // 实现具体逻辑

      const data = await Data.findOne({ where: { openid: openid } });
      if (!data) {
        res.status(500).json({ message: "Data not found" });
      } else {
        // 讲 data 转换成 dataList
        let dataList = [
          { prop: "今日学习卡牌数", num: data.today_study },
          { prop: "今日复习卡片数", num: data.today_review },
          { prop: "今日学习时长/分钟", num: data.today_duration },
          { prop: "累计学习卡片数", num: data.total_learn },
          { prop: "累计学习时长/分钟", num: data.total_duration },
          { prop: "累计签到天数", num: data.total_check_ins },
        ];
        res.status(200).json({
          message: "Get data list with third session successful",
          dataList: dataList,
        });
      }
    }
  } catch (error) {
    logger.error(`Error get data list: ${error}`);
    res.status(500).json({ message: "Fail to get data list" });
  }
};

export { getDataListWithThirdSession };
