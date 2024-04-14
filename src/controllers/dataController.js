import sequelize from "../configs/database.js";
import logger from "../configs/logger.js";
import redisPool from "../configs/redis.js";
import { Data, Checkin } from "../models/index.js";
import { Op } from "sequelize";

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

const getCheckinWithThirdSession = async (req, res) => {
  try {
    logger.info("getCheckinWithThirdSession");

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

      // 计算最大时间（今日）
      const maxDate = new Date(); // 获取当前日期
      maxDate.setHours(23, 59, 59, 999); // 设置时间为当天的最后一毫秒

      // 计算最小时间（前三个月）
      const minDate = new Date(); // 获取当前日期
      minDate.setMonth(minDate.getMonth() - 3); // 减去三个月
      minDate.setHours(0, 0, 0, 0); // 设置时间为当天的第一毫秒

      Checkin.findAll({
        where: {
          openid: openid,
          check_date: {
            [Op.between]: [minDate, maxDate],
          },
        },
      }).then((checkins) => {
        // 处理查询结果
        let updateCheckin = [];
        for (let index = 0; index < checkins.length; index++) {
          updateCheckin.push(checkins[index].check_date);
        }
        logger.debug(`checkins: ${updateCheckin}`);
        res.status(200).json({
          message: "Get check-ins successful",
          checkins: updateCheckin,
        });
      });
    }
  } catch (error) {
    logger.error(`Error get check in: ${error}`);
    res.status(500).json({ message: "Fail to get check in" });
  }
};

const checkinWithThirdSession = async (req, res) => {
  try {
    logger.info("/api/checkin");
    const { third_session } = req.body;

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
      // 实现具体逻辑, 查询今日是否已经签到，如果未签到则返回 201，并且添加签到信息；否则返回 200，已经钱都

      const today = new Date();
      let checkinToday = null;
      await Checkin.findOne({
        where: {
          openid: openid,
          check_date: {
            [Op.gte]: new Date(
              today.getFullYear(),
              today.getMonth(),
              today.getDate()
            ),
          },
        },
      }).then((result) => {
        if (result) {
          checkinToday = result;
        }
      });

      if (checkinToday) {
        res.status(200).json({ message: "Already checked in today" });
      } else {
        await Checkin.create({
          openid: openid,
          check_date: today,
        });
        // 增加总签到天数
        await Data.update(
          {
            total_check_ins: sequelize.literal("total_check_ins + 1"),
          },
          {
            where: {
              openid: openid,
            },
          }
        );
        res.status(201).json({ message: "Checkin successful" });
      }
    }
  } catch (error) {
    logger.error(`Error checkin: ${error}`);
    res.status(500).json({ message: "Failed to checkin" });
  }
};

export {
  getDataListWithThirdSession,
  getCheckinWithThirdSession,
  checkinWithThirdSession,
};
