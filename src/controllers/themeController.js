import { QueryTypes } from "sequelize";
import sequelize from "../configs/database.js";
import logger from "../configs/logger.js";
import redisPool from "../configs/redis.js";
import {
  Tag,
  Theme,
  ThemeTagConnection,
} from "../models/index.js";

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

      console.log(my_themes);

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

export {
  createThemeWithoutPicture,
  createThemeWithPicture,
  getMyThemeAndSubTheme,
};
