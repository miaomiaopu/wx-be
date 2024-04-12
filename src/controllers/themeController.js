import logger from "../configs/logger.js";
import redisPool from "../configs/redis.js";
import Tag from "../models/Tag.js";
import Theme from "../models/Theme.js";
import ThemeTagConnection from "../models/ThemeTagConnection.js";

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

    const theme_picture =
      "http://localhost:8000/images/" + req.file.originalname;

    const { third_session, themeName } = req.body;
    const tags = JSON.parse(req.body.tags)

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

export { createThemeWithoutPicture, createThemeWithPicture };
