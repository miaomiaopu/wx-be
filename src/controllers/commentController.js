import sequelize from "../configs/database.js";
import { QueryTypes } from "sequelize";
import logger from "../configs/logger.js";
import redisPool from "../configs/redis.js";
import { Comment } from "../models/index.js";
import { sendComment } from "../utils/sendMessage.js";

const getComments = async (req, res) => {
  try {
    logger.info("/api/getComments");

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
      let comments = [];
      await sequelize
        .query(
          `
        SELECT
          comments.comment_id,
          users.nickname,
          comments.comment_content,
          DATE_FORMAT(comments.comment_date, '%Y-%c-%e') AS comment_date,
          IF(comments.openid = :openid, 1, 0) AS is_belong
        FROM
          comments
        INNER JOIN
          users ON comments.openid = users.openid
        WHERE
          comments.card_id = :card_id;
      `,
          {
            type: QueryTypes.SELECT,
            raw: true,
            replacements: { openid: openid, card_id: card_id },
          }
        )
        .then((result) => {
          comments = result;
        });

      res.status(200).json({
        message: "get comments successful",
        comments: comments,
      });
    }
  } catch (error) {
    logger.error(`Error get comments: ${error}`);
    res.status(500).json({ message: "Fail to get comments" });
  }
};

const createComment = async (req, res) => {
  try {
    logger.info("/api/createComment");

    const { third_session, card_id, comment_content } = req.body;

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
      await Comment.create({
        openid: openid,
        card_id: card_id,
        comment_content: comment_content,
      });

      await sendComment(card_id);

      res.status(201).json({
        message: "create comment successful",
      });
    }
  } catch (error) {
    logger.error(`Error create comment: ${error}`);
    res.status(500).json({ message: "Fail to create comment" });
  }
};

const deleteComment = async (req, res) => {
  try {
    logger.info("/api/deleteComment");

    const { third_session, comment_id } = req.body;

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
      await Comment.destroy({
        where: {
          openid: openid,
          comment_id: comment_id,
        },
      });

      res.status(200).json({
        message: "delete comment successful",
      });
    }
  } catch (error) {
    logger.error(`Error delete comment: ${error}`);
    res.status(500).json({ message: "Fail to delete comment" });
  }
};

export { getComments, createComment, deleteComment };
