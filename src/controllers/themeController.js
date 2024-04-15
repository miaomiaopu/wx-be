import { QueryTypes } from "sequelize";
import sequelize from "../configs/database.js";
import logger from "../configs/logger.js";
import redisPool from "../configs/redis.js";
import {
  Information,
  Tag,
  Theme,
  ThemeCardConnection,
  ThemeSubscriberConnection,
  ThemeTagConnection,
} from "../models/index.js";
import { deleteByCardIds } from "../utils/deleteByCardIds.js";
import deleteImage from "../utils/deleteImage.js";

const createTags = async (tags, theme_id) => {
  let tagIds = [];

  for (const tag_name of tags) {
    await Tag.findOrCreate({ where: { tag_name: tag_name } }).then(
      ([tag, created]) => {
        tagIds.push(tag.tag_id);
      }
    );
  }

  await ThemeTagConnection.bulkCreate(
    tagIds.map((tag_id) => ({ theme_id: theme_id, tag_id: tag_id }))
  );
};
const createTheme = async (openid, tags, themeName, theme_picture = null) => {
  if (theme_picture) {
    await Theme.create({
      openid: openid,
      theme_name: themeName,
      theme_picture: theme_picture,
    }).then((result) => {
      if (tags) {
        createTags(tags, result.theme_id);
      }
    });
  } else {
    await Theme.create({
      openid: openid,
      theme_name: themeName,
    }).then((result) => {
      if (tags) {
        createTags(tags, result.theme_id);
      }
    });
  }
};

const createThemeWithoutPicture = async (req, res) => {
  try {
    logger.info("/api/createThemeWithoutPicture");

    const { third_session, themeName, tags } = req.body;
    // 获取openid，处理图片逻辑，默认图片(public/images/default-image.jpg)，处理标签逻辑

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
      createTheme(openid, tags, themeName);
      res.status(201).json({ message: "Successful create theme" });
    }
  } catch (error) {
    logger.error(`Error create theme: ${error}`);
    res.status(500).json({ message: "Fail to create theme" });
  }
};

const createThemeWithPicture = async (req, res) => {
  try {
    logger.info("/api/createThemeWithPicture");
    // 获取openid，处理图片逻辑，默认图片(public/images/default-image.jpg)，处理标签逻辑

    const theme_picture = "http://localhost:8000/images/" + req.file.filename;

    const { third_session, themeName } = req.body;
    const tags = JSON.parse(req.body.tags);

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
      createTheme(openid, tags, themeName, theme_picture);
      res.status(201).json({ message: "Successful create theme" });
    }
  } catch (error) {
    logger.error(`Error create theme: ${error}`);
    res.status(500).json({ message: "Fail to create theme" });
  }
};

const generateThemeResult = (themes) => {
  // 设置输出
  for (const theme of themes) {
    if (theme.tags.length == 0) {
      theme.tags = [];
    } else {
      theme.tags = theme.tags.split(",");
    }
  }
  return themes;
};

const getMyThemeAndSubTheme = async (req, res) => {
  try {
    logger.info("/api/getMyThemeAndSubTheme");

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
      // 处理 my_themes 的具体逻辑

      let my_themes = [];

      // 原始查询
      await sequelize
        .query(
          `
          select themes.theme_id, theme_name, theme_picture, total_subscription, COALESCE(group_concat(tag_name), '') as 'tags'
          from themes
          left join theme_tag_conn on themes.theme_id = theme_tag_conn.theme_id
          left join tags on theme_tag_conn.tag_id = tags.tag_id
          where openid = :openid
          group by themes.theme_id;
          `,
          {
            type: QueryTypes.SELECT,
            raw: true,
            replacements: { openid: openid },
          }
        )
        .then((result) => {
          my_themes = result;
        });

      // 处理 sub_themes
      let sub_themes = [];
      await sequelize
        .query(
          `
        select themes.theme_id, theme_name, theme_picture, total_subscription, COALESCE(group_concat(tag_name), '') as 'tags'
        from themes
        left join theme_tag_conn on themes.theme_id = theme_tag_conn.theme_id
        left join tags on theme_tag_conn.tag_id = tags.tag_id
        where themes.theme_id in (
          select theme_id
          from theme_subscriber_conn
          where openid = :openid
        )
        group by themes.theme_id;
        `,
          {
            type: QueryTypes.SELECT,
            raw: true,
            replacements: { openid: openid },
          }
        )
        .then((result) => {
          sub_themes = result;
        });

      if (my_themes) {
        my_themes = generateThemeResult(my_themes);
      }
      if (sub_themes) {
        sub_themes = generateThemeResult(sub_themes);
      }

      res.status(200).json({
        message: "Successful get theme",
        my_themes: my_themes,
        sub_themes: sub_themes,
      });
    }
  } catch (error) {
    logger.error(`Error get theme: ${error}`);
    res.status(500).json({ message: "Fail to get theme" });
  }
};

const cancelSubTheme = async (req, res) => {
  try {
    logger.info("/api/cancelSubTheme");

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
      // 处理具体逻辑
      // 根据 theme_id 和 openid删除
      await ThemeSubscriberConnection.destroy({
        where: {
          theme_id: theme_id,
          openid: openid,
        },
      });

      res.status(200).json({
        message: "Successful delete sub theme",
      });
    }
  } catch (error) {
    logger.error(`Error delete sub theme:" ${error}`);
    res.status(500).json({ message: "Fail to delete sub theme" });
  }
};

const deleteMyTheme = async (req, res) => {
  try {
    logger.info("/api/deleteMyTheme");

    const { third_session, theme_id } = req.body;

    let openid = null;
    await redisPool.get(third_session, (err, result) => {
      if (err) {
        logger.error(`Redis error: ${err}`);
      } else {
        openid = result;
      }
    });

    // 获取 theme
    let theme = null;
    await Theme.findOne({
      where: {
        theme_id: theme_id,
      },
    }).then((result) => {
      theme = result;
    });

    if (!openid) {
      res.status(404).json({ message: "Third session key not found" });
    } else {
      // 处理具体逻辑
      // 获取 card_ids
      let cardIds = [];
      await ThemeCardConnection.findAll({
        where: {
          theme_id: theme_id,
        },
      }).then((result) => {
        cardIds = result.map((connection) => connection.card_id);
      });

      // 根据 theme_id 删除对应的 card, theme_card_connect
      // 根据 card_id 删除对应的 study_time, like, comment, picture
      // 删除对应图片

      await deleteByCardIds(cardIds);

      // 发送信息给订阅了的用户 informations
      let openidSubs = [];
      await ThemeSubscriberConnection.findAll({
        where: {
          theme_id: theme_id,
        },
      }).then((result) => {
        openidSubs = result.map((connection) => connection.openid);
      });

      const message = `您订阅的 ${theme.theme_id}-${theme.theme_name} 被作者删除`;

      await Promise.all(
        openidSubs.map((openid) => {
          return Information.create({
            openid: openid,
            message: message,
          });
        })
      );
      // 删除对应的订阅记录 theme_subscriber_conn, 对应的 tag, theme
      await ThemeSubscriberConnection.destroy({
        where: {
          theme_id: theme_id,
        },
      });

      // 先判断tag是否被其他的主题使用，没有就删除tag

      let tagIds = [];
      await sequelize
        .query(
          `
        select tag_id
        from theme_tag_conn
        where theme_id = :theme_id and tag_id in (select tag_id from theme_tag_conn group by tag_id having count(*) = 1);
        `,
          {
            type: QueryTypes.SELECT,
            raw: true,
            replacements: { theme_id: theme_id },
          }
        )
        .then((result) => {
          tagIds = result.map((res) => res.tag_id);
        });

      console.log(theme_id);
      console.log(tagIds);

      deleteImage(theme.theme_picture);

      await Promise.all([
        Tag.destroy({
          where: {
            tag_id: tagIds,
          },
        }),
        ThemeTagConnection.destroy({
          where: {
            theme_id: theme_id,
          },
        }),
        Theme.destroy({
          where: {
            theme_id: theme_id,
          },
        }),
      ]);

      res.status(200).json({
        message: "Successful delete my theme",
      });
    }
  } catch (error) {
    logger.error(`Error delete my theme:" ${error}`);
    res.status(500).json({ message: "Fail to delete my theme" });
  }
};

export {
  createThemeWithoutPicture,
  createThemeWithPicture,
  getMyThemeAndSubTheme,
  cancelSubTheme,
  deleteMyTheme,
};
