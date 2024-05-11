import { Op } from "sequelize";
import sequelize from "../configs/database.js";
import {
  Card,
  CardPicture,
  CardStudyTime,
  Data,
  ThemeCardConnection,
} from "../models/index.js";
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
      await CardStudyTime.destroy({
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
  // 选择算法，阶段为 0 的 最后选，阶段为 3 的不选
  // 优先选择距离需要复习时间较长的卡片
  // 例: 0-1，1-2，2-3，今天天数为 4，选择 2 号
  // 每次选择10个进行一轮复习，不足十个的选择所有
  try {
    logger.info("/api/getStudyCards");
    const { third_session } = req.query;

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
      let studyTimes = [];
      const now = new Date();
      // phase = 0 ; phase = 1, 当前时间 > last_study_time + 1 天 时; phase = 2, 当前时间 > last_study_time + 3;
      // 并且根据 当前时间 - (last_study_time + ?) 的 插值进行排序, 越大越早。选最多10个
      await CardStudyTime.findAll({
        where: {
          openid: openid,
          // 使用 Sequelize 的符号运算符来进行条件判断
          [Op.or]: [
            // phase = 0 或者 phase = 1 且当前时间小于 last_study_time + 1 天
            {
              [Op.or]: [
                { phase: 0 },
                {
                  phase: 1,
                  last_study_time: {
                    [Op.lte]: new Date(now.getTime() - 24 * 60 * 60 * 1000), // 当前时间减去 1 天的毫秒数
                  },
                },
              ],
            },
            // phase = 2 且当前时间小于 last_study_time + 3 天
            {
              phase: 2,
              last_study_time: {
                [Op.lte]: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000), // 当前时间减去 3 天的毫秒数
              },
            },
          ],
        },
        order: [
          ["phase", "DESC"], // 先按照 phase 排序
          ["last_study_time", "ASC"], // 如果 phase 相同，则按照 last_study_time 降序排序
        ],
        limit: 10,
      }).then((res) => {
        // studyTimes = [{card_id, phase}, {}]
        res.forEach((item) => {
          studyTimes.push({
            card_id: item.card_id,
            phase: item.phase,
            s_phase: 0,
          });
        });
      });

      if (studyTimes.length == 0) {
        res.status(202).json({
          message: "Study card is null",
        });
      } else {
        res.status(200).json({
          message: "Get study cards successful",
          studyTimes,
        });
      }
    }
  } catch (error) {
    logger.error(`Error Get study cards: ${error}`);
    res.status(500).json({ message: "Failed to Get study cards" });
  }
};

const getStudyCard = async (req, res) => {
  try {
    logger.info("/api/getCard");

    const third_session = req.query.third_session;
    const card_id = req.query.card_id;

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
      let card_title = "",
        str1 = "",
        str2 = "",
        str3 = "",
        str4 = "",
        image1 = "",
        image2 = "",
        image3 = "";

      // 获取card_content
      let content = "";
      await Card.findOne({ where: { card_id: card_id } }).then((result) => {
        card_title = result.card_title;
        content = result.card_content;
      });

      const regex = /<i>\d<i>/g;

      const str = content.split(regex);

      for (let index = 0; index < str.length; index++) {
        const element = str[index];
        if (index == 0) {
          str1 = element;
        } else if (index == 1) {
          str2 = element;
        } else if (index == 2) {
          str3 = element;
        } else if (index == 3) {
          str4 = element;
        }
      }

      let images = [];
      await CardPicture.findAll({
        where: { card_id: card_id },
        order: [["card_picture_id", "ASC"]],
      }).then((result) => {
        images = result.map((res) => res.picture);
      });

      for (let index = 0; index < images.length; index++) {
        const element = images[index];
        if (index == 0) {
          image1 = element;
        } else if (index == 1) {
          image2 = element;
        } else if (index == 2) {
          image3 = element;
        }
      }

      res.status(200).json({
        message: "get card successful",
        card_title: card_title,
        str1: str1,
        str2: str2,
        str3: str3,
        str4: str4,
        image1: image1,
        image2: image2,
        image3: image3,
      });
    }
  } catch (error) {
    logger.error(`Error get card: ${error}`);
    res.status(500).json({ message: "Fail to get card" });
  }
};

const completeStudyCard = async (req, res) => {
  try {
    logger.info("/api/completeStudyCard");
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
      // 先查询出需要更新的数据
      const cardStudyTime = await CardStudyTime.findOne({
        where: { card_id: card_id, openid: openid },
      });

      // 如果找到了对应的记录，则更新
      if (cardStudyTime) {
        if (cardStudyTime.phase == 0) {
          await Data.update(
            { today_study: sequelize.literal("today_study + 1") },
            { where: { openid: openid } }
          );
        } else if (cardStudyTime.phase == 1) {
          await Data.update(
            { today_review: sequelize.literal("today_review + 1") },
            { where: { openid: openid } }
          );
        } else if (cardStudyTime.phase == 2) {
          await Data.update(
            {
              today_review: sequelize.literal("today_review + 1"),
              total_learn: sequelize.literal("total_learn + 1"),
            },
            { where: { openid: openid } }
          );
        }

        const newPhase = cardStudyTime.phase + 1; // 计算新的 phase
        await CardStudyTime.update(
          { phase: newPhase },
          { where: { card_id: card_id, openid: openid } }
        );
      }

      res.status(200).json({
        message: "Complete Study Card successful",
      });
    }
  } catch (error) {
    logger.error(`Error Complete Study Card: ${error}`);
    res.status(500).json({ message: "Failed to Complete Study Card" });
  }
};

const studyTime = async (req, res) => {
  try {
    logger.info("/api/studyTime");
    const { third_session, duration } = req.body;

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
      await Data.update(
        {
          today_duration: sequelize.literal(`today_duration + ${duration}`),
          total_duration: sequelize.literal(`total_duration + ${duration}`),
        },
        { where: { openid: openid } }
      );

      res.status(200).json({
        message: "Study Time successful",
      });
    }
  } catch (error) {
    logger.error(`Error Study Time: ${error}`);
    res.status(500).json({ message: "Failed to Study Time" });
  }
};

export {
  getIsAllStudy,
  getIsStudy,
  selectCard,
  selectCards,
  cancelSelectCards,
  cancelSelectCard,
  getStudyCards,
  getStudyCard,
  completeStudyCard,
  studyTime,
};
