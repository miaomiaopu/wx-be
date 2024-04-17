import sequelize from "../configs/database.js";
import { QueryTypes } from "sequelize";
import logger from "../configs/logger.js";
import redisPool from "../configs/redis.js";

const getAuthorAndCards = async (req, res) => {
  try {
    logger.info("/api/getAuthorAndCards");

    const third_session = req.query.third_session;
    const theme_id = req.query.theme_id;

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
      let nickname = "";
      let cards = [];

      // 获取作者
      await sequelize
        .query(
          `
        select nickname
        from users, themes
        where users.openid = themes.openid and theme_id = :theme_id;
        `,
          {
            type: QueryTypes.SELECT,
            raw: true,
            replacements: { theme_id: theme_id },
          }
        )
        .then((result) => {
          nickname = result[0].nickname;
        });
      // 获取 Cards
      await sequelize
        .query(
          `
      select cards.card_id, card_title
      from cards, theme_card_conn
      where cards.card_id = theme_card_conn.card_id and theme_id = 15;
      `,
          {
            type: QueryTypes.SELECT,
            raw: true,
            replacements: { theme_id: theme_id },
          }
        )
        .then((result) => {
          cards = result;
        });

      res.status(200).json({
        message: "get author and cards successful",
        nickname: nickname,
        cards: cards,
      });
    }
  } catch (error) {
    logger.error(`Error get author and cards: ${error}`);
    res.status(500).json({ message: "Fail to get author and cards" });
  }
};

export { getAuthorAndCards };
