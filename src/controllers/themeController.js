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
import { sendThemeChange } from "../utils/sendMessage.js";

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

      // 减少订阅数
      await Theme.update(
        {
          total_subscription: sequelize.literal("total_subscription - 1"),
        },
        {
          where: {
            theme_id: theme_id,
          },
        }
      );

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

      await sendThemeChange(theme_id, 1);

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

const upTheme = async (openid, theme_id, tags, themeName, theme_picture) => {
  // 更新主题
  let theme = null;
  let old_picture = null;

  await Theme.findOne({
    where: {
      theme_id: theme_id,
    },
  }).then((result) => {
    theme = result;
    if (!theme) {
      throw new Error("Theme not found");
    }

    theme.theme_name = themeName;
    if (theme_picture) {
      old_picture = theme.theme_picture;
      theme.theme_picture = theme_picture;
    }

    theme.save();
  });

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
  ]);

  // 先查找旧的 Tags
  if (tags) {
    createTags(tags, theme_id);
  }

  return old_picture;
};

const updateTheme = async (req, res) => {
  try {
    logger.info("/api/updateTheme or /api/updateThemeWithoutPicture");
    // 获取openid，处理图片逻辑，默认图片(public/images/default-image.jpg)，处理标签逻辑

    let theme_picture = null;
    if (req.file) {
      theme_picture = "http://localhost:8000/images/" + req.file.filename;
    }

    const { third_session, themeName, theme_id } = req.body;
    let tags = null;
    if (!theme_picture) {
      tags = req.body.tags;
    } else {
      tags = JSON.parse(req.body.tags);
    }

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
      const old_picture = await upTheme(
        openid,
        theme_id,
        tags,
        themeName,
        theme_picture
      );
      console.log(old_picture);
      deleteImage(old_picture);

      await sendThemeChange(theme_id, 0);
      res.status(200).json({ message: "Successful update theme" });
    }
  } catch (error) {
    logger.error(`Error update theme: ${error}`);
    res.status(500).json({ message: "Fail to update theme" });
  }
};

const searchTheme = async (req, res) => {
  // 需要未被订阅的，title符合关键词，tag符合关键词
  try {
    logger.info("/api/searchTheme");

    const third_session = req.query.third_session;
    const search = `%${req.query.search}%`;

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
      // 处理 title 的具体逻辑
      let res_themes = [];
      await sequelize
        .query(
          `
          SELECT
            themes.theme_id,
            theme_name,
            theme_picture,
            total_subscription,
            COALESCE(GROUP_CONCAT(tag_name), '') AS 'tags'
          FROM themes
          LEFT JOIN theme_tag_conn ON themes.theme_id = theme_tag_conn.theme_id
          LEFT JOIN tags ON theme_tag_conn.tag_id = tags.tag_id
          WHERE
            openid <> :openid
            AND themes.theme_id NOT IN (SELECT theme_id FROM theme_subscriber_conn WHERE openid = :openid)     -- 未被该用户订阅
            AND (theme_name LIKE :search OR themes.theme_id IN (SELECT theme_id FROM theme_tag_conn WHERE tag_id IN (SELECT tag_id FROM tags WHERE tag_name LIKE :search))) -- 含有特定标签
          GROUP BY themes.theme_id;
        `,
          {
            type: QueryTypes.SELECT,
            raw: true,
            replacements: { openid: openid, search: search },
          }
        )
        .then((result) => {
          res_themes = result;
        });

      if (res_themes) {
        res_themes = generateThemeResult(res_themes);
      }

      res.status(200).json({
        message: "Successful get theme",
        res_themes: res_themes,
      });
    }
  } catch (error) {
    logger.error(`Error get theme: ${error}`);
    res.status(500).json({ message: "Fail to get theme" });
  }
};

const subTheme = async (req, res) => {
  try {
    logger.info("/api/subTheme");

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

      await ThemeSubscriberConnection.create({
        theme_id: theme_id,
        openid: openid,
      });

      // 增加订阅数
      await Theme.update(
        {
          total_subscription: sequelize.literal("total_subscription + 1"),
        },
        {
          where: {
            theme_id: theme_id,
          },
        }
      );

      res.status(201).json({
        message: "Successful sub theme",
      });
    }
  } catch (error) {
    logger.error(`Error sub theme:" ${error}`);
    res.status(500).json({ message: "Fail to sub theme" });
  }
};

const getBelongAndSub = async (req, res) => {
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
      let belongString = 0;
      let substring = 0;

      await Theme.findOne({
        where: { openid: openid, theme_id: theme_id },
      }).then((res) => {
        if (res) {
          belongString = 1;
        }
      });

      await ThemeSubscriberConnection.findOne({
        where: { openid: openid, theme_id: theme_id },
      }).then((res) => {
        if (res) {
          substring = 1;
        }
      });

      res.status(200).json({
        message: "get author and cards successful",
        belongString: belongString,
        substring: substring,
      });
    }
  } catch (error) {
    logger.error(`Error get author and cards: ${error}`);
    res.status(500).json({ message: "Fail to get author and cards" });
  }
};

export {
  createThemeWithoutPicture,
  createThemeWithPicture,
  getMyThemeAndSubTheme,
  cancelSubTheme,
  deleteMyTheme,
  updateTheme,
  searchTheme,
  subTheme,
  getBelongAndSub,
};
