import redisPool from "../configs/redis.js";
import logger from "../configs/logger.js";
import { Information } from "../models/index.js";

const getInformations = async (req, res) => {
  try {
    logger.info("/api/getInformations");
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
      logger.debug(`openid: ${openid}`);
      // 实现具体逻辑

      let informations = [];
      await Information.findAll({ where: { openid: openid } }).then(
        (result) => {
          logger.debug(`info_length: ${result.length}`);
          if (result.length != 0) {
            for (let i = 0; i < result.length; i++) {
              // 格式化时间
              let createdAtDate = result[i].create_at;
              let year = createdAtDate.getFullYear();
              let month = (createdAtDate.getMonth() + 1)
                .toString()
                .padStart(2, "0"); // 月份需要加1，且保证两位数
              let day = createdAtDate.getDate().toString().padStart(2, "0"); // 日期需要保证两位数
              let hours = createdAtDate.getHours().toString().padStart(2, "0"); // 小时需要保证两位数
              let minutes = createdAtDate
                .getMinutes()
                .toString()
                .padStart(2, "0"); // 分钟需要保证两位数
              let formattedDate = `${year}-${month}-${day} ${hours}:${minutes}`;

              informations.push({
                info_id: result[i].info_id,
                message: result[i].message,
                is_handle: result[i].is_handle,
                time: formattedDate,
              });
            }
          }
        }
      );

      res.status(200).json({
        message: "Get informations successful",
        informations: informations,
      });
    }
  } catch (error) {
    logger.error(`Error Get informations: ${error}`);
    res.status(500).json({ message: "Failed to get informations" });
  }
};

const handleInformation = async (req, res) => {
  try {
    logger.info("/api/handleInformation");
    const { third_session, info_id } = req.body;

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
      logger.debug(`info_id: ${info_id}`);
      // 实现具体逻辑

      await Information.update(
        { is_handle: true },
        { where: { openid: openid, info_id: info_id } }
      );

      res.status(200).json({
        message: "Change information successful",
      });
    }
  } catch (error) {
    logger.error(`Error change information: ${error}`);
    res.status(500).json({ message: "Failed to change information" });
  }
};

const handleAllInformations = async (req, res) => {
  try {
    logger.info("/api/handleAllInformations");
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
      // 实现具体逻辑

      await Information.update(
        { is_handle: true },
        { where: { openid: openid } }
      );
      res.status(200).json({
        message: "Change informations successful",
      });
    }
  } catch (error) {
    logger.error(`Error change informations: ${error}`);
    res.status(500).json({ message: "Failed to change informations" });
  }
};

const getInfoDot = async (req, res) => {
  try {
    logger.info("/api/getInfoDot");
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
      logger.debug(`openid: ${openid}`);
      // 实现具体逻辑

      let info_dot = null;
      // 判断是否有未处理的信息
      await Information.findOne({
        where: {
          openid: openid,
          is_handle: false,
        },
      }).then((info) => {
        if (info) {
          info_dot = true;
        } else {
          info_dot = false;
        }
      });

      logger.debug(`info_dot: ${info_dot}`);

      res.status(200).json({
        message: "Get info dot successful",
        info_dot: info_dot,
      });
    }
  } catch (error) {
    logger.error(`Error get info dot: ${error}`);
    res.status(500).json({ message: "Failed to info dot" });
  }
};

export {
  getInformations,
  handleInformation,
  handleAllInformations,
  getInfoDot,
};
