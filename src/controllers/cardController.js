import sequelize from "../configs/database.js";
import { QueryTypes } from "sequelize";
import logger from "../configs/logger.js";
import redisPool from "../configs/redis.js";
import {
  Card,
  CardLikeConnection,
  CardPicture,
  ThemeCardConnection,
} from "../models/index.js";
import { deleteByCardId } from "../utils/deleteByCardIds.js";
import { sendCardChange } from "../utils/sendMessage.js";

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
        select cards.card_id, card_title, DATE_FORMAT(cards.card_modified_date, '%Y-%c-%e') AS card_modified_date
        from cards, theme_card_conn
        where cards.card_id = theme_card_conn.card_id and theme_id = :theme_id;
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

const createCardWithPicture = async (req, res) => {
  try {
    logger.info("/api/createCardWithPicture");

    const file = req.file;

    const index = parseInt(req.body.index);

    if (index > 0) {
      const card_id = parseInt(req.body.card_id);

      CardPicture.create({
        card_picture_id: index,
        picture: `http://localhost:8000/images/${file.filename}`,
        card_id: card_id,
      });

      res.status(201).json({ message: "Create card successful" });
    } else {
      const { third_session, card_name, card_content } = req.body;

      const theme_id = parseInt(req.body.theme_id);

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
        let card_id = 0;
        await Card.create({
          card_title: card_name,
          card_content: card_content,
        }).then((result) => {
          card_id = result.card_id;
        });

        await ThemeCardConnection.create({
          theme_id: theme_id,
          card_id: card_id,
        });

        CardPicture.create({
          card_picture_id: index,
          picture: `http://localhost:8000/images/${file.filename}`,
          card_id: card_id,
        });

        await sendCardChange(card_id, 0);

        res
          .status(201)
          .json({ message: "Create card successful", card_id: card_id });
      }
    }
  } catch (error) {
    logger.error(`Error create card: ${error}`);
    res.status(500).json({ message: "Fail to create card" });
  }
};

const createCardWithoutPicture = async (req, res) => {
  try {
    logger.info("/api/createCardWithoutPicture");

    const { third_session, card_name, card_content, theme_id } = req.body;

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
      let card_id = 0;
      await Card.create({
        card_title: card_name,
        card_content: card_content,
      }).then((result) => {
        card_id = result.card_id;
      });

      await ThemeCardConnection.create({
        theme_id: theme_id,
        card_id: card_id,
      });

      await sendCardChange(card_id, 0);

      res.status(201).json({ message: "Create card successful" });
    }
  } catch (error) {
    logger.error(`Error create card: ${error}`);
    res.status(500).json({ message: "Fail to create card" });
  }
};

const getCard = async (req, res) => {
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
      let str1 = "",
        str2 = "",
        str3 = "",
        str4 = "",
        image1 = "",
        image2 = "",
        image3 = "";

      // 获取card_content
      let content = "";
      let card_modified_date = "";
      await Card.findOne({ where: { card_id: card_id } }).then((result) => {
        content = result.card_content;
        const date = result.card_modified_date;
        card_modified_date = `${date.getFullYear()}-${
          date.getMonth() + 1
        }-${date.getDate()} ${date.getHours()}`;
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
        str1: str1,
        str2: str2,
        str3: str3,
        str4: str4,
        image1: image1,
        image2: image2,
        image3: image3,
        card_modified_date: card_modified_date,
      });
    }
  } catch (error) {
    logger.error(`Error get card: ${error}`);
    res.status(500).json({ message: "Fail to get card" });
  }
};

const deleteCard = async (req, res) => {
  try {
    logger.info("/api/deleteCard");

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
      await sendCardChange(card_id, 1);
      await deleteByCardId(card_id);

      res.status(200).json({ message: "Delete card successful" });
    }
  } catch (error) {
    logger.error(`Error delete card: ${error}`);
    res.status(500).json({ message: "Fail to delete card" });
  }
};

const isLike = async (req, res) => {
  try {
    logger.info("/api/isLike");

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
      let is_like = false;
      await CardLikeConnection.findOne({
        where: {
          card_id: card_id,
          openid: openid,
        },
      }).then((res) => {
        if (res) {
          is_like = true;
        }
      });

      res
        .status(200)
        .json({ message: "Is like card successful", is_like: is_like });
    }
  } catch (error) {
    logger.error(`Error Is like card: ${error}`);
    res.status(500).json({ message: "Fail to is like card" });
  }
};

const likeCard = async (req, res) => {
  try {
    logger.info("/api/likeCard");

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
      await CardLikeConnection.create({ card_id: card_id, openid: openid });

      res.status(201).json({ message: "Like card successful" });
    }
  } catch (error) {
    logger.error(`Error like card: ${error}`);
    res.status(500).json({ message: "Fail to like card" });
  }
};

const unlikeCard = async (req, res) => {
  try {
    logger.info("/api/unlikeCard");

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
      await CardLikeConnection.destroy({
        where: {
          card_id: card_id,
          openid: openid,
        },
      });
      res.status(200).json({ message: "Unlike card successful" });
    }
  } catch (error) {
    logger.error(`Error unlike card: ${error}`);
    res.status(500).json({ message: "Fail to unlike card" });
  }
};

export {
  getAuthorAndCards,
  createCardWithPicture,
  createCardWithoutPicture,
  getCard,
  deleteCard,
  isLike,
  likeCard,
  unlikeCard,
};
