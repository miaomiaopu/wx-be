import { Op } from "sequelize";
import { CardStudyTime, ThemeCardConnection } from "../models/index.js";
import logger from "../configs/logger.js";
import redisPool from "../configs/redis.js";

const getIsStudy = async (req, res) => {
  try {
    logger.info("/api/getIsStudy");
    const { third_session, card_id } = req.query;

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
      let is_study = 0;

      await CardStudyTime.findOne({
        where: {
          openid: openid,
          card_id: card_id,
        },
      }).then((res) => {
        if (res) {
          if (res.phase == 3) {
            is_study = 2;
          } else {
            is_study = 1;
          }
        }
      });

      res.status(200).json({
        message: "Get is study successful",
        is_study: is_study,
      });
    }
  } catch (error) {
    logger.error(`Error Get is study: ${error}`);
    res.status(500).json({ message: "Failed to Get is study" });
  }
};

const getIsAllStudy = async (req, res) => {
  try {
    logger.info("/api/getIsAllStudy");
    const { third_session, theme_id } = req.query;

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
      let is_all_study = 0;

      let cardIds = [];
      await ThemeCardConnection.findAll({
        where: {
          theme_id: theme_id,
        },
      }).then((res) => {
        cardIds = res.map((connection) => connection.card_id);
      });

      // 判断所有的 cardIds 在 CardStudyTime 中。并且如果 phase 都为 3 则 is_all_study = 2。如果所有的 phase 不是都为 3，则 is_all_study = 1。如果有没在 CardStudyTime 的 card_id，则 is_all_study = 0

      // 查询 CardStudyTime 中是否存在这些 card_id
      let all_studty_cards = [];
      let over_study_cards = [];
      await CardStudyTime.findAll({
        where: {
          card_id: cardIds,
          openid: openid,
        },
      }).then((res) => {
        all_studty_cards = res;
        over_study_cards = res.filter((item) => item.phase === 3);
      });

      if (over_study_cards.length == cardIds.length) {
        is_all_study = 2;
      } else if (all_studty_cards.length == cardIds.length) {
        is_all_study = 1;
      }

      res.status(200).json({
        message: "Get is all study successful",
        is_all_study: is_all_study,
      });
    }
  } catch (error) {
    logger.error(`Error Get is all study: ${error}`);
    res.status(500).json({ message: "Failed to Get is all study" });
  }
};

const selectCards = async (req, res) => {
  try {
    logger.info("/api/selectCards");
    const { third_session, theme_id } = req.body;

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
      let cardIds = [];
      await ThemeCardConnection.findAll({
        where: {
          theme_id: theme_id,
        },
      }).then((res) => {
        cardIds = res.map((connection) => connection.card_id);
      });

      // 向 cardstudytime 中添加所有 {openid, card_id}，当 对应组合已经存在时，则不添加

      // 构建一个数组，存储需要插入的记录
      const recordsToInsert = [];

      // 查询已存在的记录
      const existingRecords = await CardStudyTime.findAll({
        where: {
          card_id: cardIds,
          openid: openid,
        },
        attributes: ["card_id"], // 只获取 card_id 字段
      });

      // 构建一个 Map，用于快速查找已存在的记录
      const existingMap = new Map();
      existingRecords.forEach((item) => {
        existingMap.set(item.card_id, true);
      });

      // 遍历 cardIds，构建需要插入的记录数组
      cardIds.forEach((card_id) => {
        if (!existingMap.has(card_id)) {
          recordsToInsert.push({
            openid: openid,
            card_id: card_id,
          });
        }
      });

      // 插入新记录
      await CardStudyTime.bulkCreate(recordsToInsert);

      res.status(201).json({
        message: "Select cards successful",
      });
    }
  } catch (error) {
    logger.error(`Error Select cards: ${error}`);
    res.status(500).json({ message: "Failed to Select cards" });
  }
};

const selectCard = async (req, res) => {
  try {
    logger.info("/api/selectCard");
    const { third_session, card_id } = req.body;

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
      await CardStudyTime.create({
        openid: openid,
        card_id: card_id,
      });

      res.status(201).json({
        message: "Select card successful",
      });
    }
  } catch (error) {
    logger.error(`Error Select card: ${error}`);
    res.status(500).json({ message: "Failed to Select card" });
  }
};

const cancelSelectCards = async (req, res) => {
  try {
    logger.info("/api/cancelSelectCards");
    const { third_session, theme_id } = req.body;

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
      let cardIds = [];
      await ThemeCardConnection.findAll({
        where: {
          theme_id: theme_id,
        },
      }).then((res) => {
        cardIds = res.map((connection) => connection.card_id);
      });

      // 删除对应 openid 和 cardIds 且 phase != 3 的记录

      await CardStudyTime.destroy({
        where: {
          openid: openid,
          card_id: cardIds,
          phase: {
            [Op.ne]: 3, // phase 不等于 3
          },
        },
      });
      res.status(200).json({
        message: "Cancel select cards successful",
      });
    }
  } catch (error) {
    logger.error(`Error Cancel select cards: ${error}`);
    res.status(500).json({ message: "Failed to Cancel select cards" });
  }
};

const cancelSelectCard = async (req, res) => {
  try {
    logger.info("/api/selectCard");
    const { third_session, card_id } = req.body;

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
      await CardStudyTime.create({
        openid: openid,
        card_id: card_id,
      });

      res.status(201).json({
        message: "Select card successful",
      });
    }
  } catch (error) {
    logger.error(`Error Select card: ${error}`);
    res.status(500).json({ message: "Failed to Select card" });
  }
};

const getStudyCards = async (req, res) => {
  // 选择算法，阶段为 0 的 最后选
  // 优先选择距离需要复习时间较长的卡片
  // 例: 0-1，1-2，2-3，今天天数为 4，选择 2 号
  // 每次选择10个进行一轮复习
};

const completeStudyCard = async (req, res) => {};

export {
  getIsAllStudy,
  getIsStudy,
  selectCard,
  selectCards,
  cancelSelectCards,
  cancelSelectCard,
  getStudyCards,
  completeStudyCard,
};
