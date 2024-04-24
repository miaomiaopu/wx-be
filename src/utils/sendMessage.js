import { Card, Information, Theme, ThemeCardConnection } from "../models/index.js";

const sendThemeChange = async (theme_id, changeOrDelete) => {
  let openids = [];
  let message = "";
  if (changeOrDelete == 0) {
    message = `您订阅的主题: ${theme_id} 被作者修改`;
  } else {
    message = `您订阅的主题: ${theme_id} 被作者删除`;
  }

  await Theme.findAll({
    where: {
      theme_id: theme_id,
    },
  }).then((res) => {
    openids = res.map((theme) => theme.openid);
  });

  const infomations = openids.map((openid) => ({ openid, message }));
  await Information.bulkCreate(infomations);
};

const sendCardChange = async (card_id, createOrDelete) => {
  let openids = [];
  let message = "";

  let theme_id = 0;
  await ThemeCardConnection.findOne({
    where: {
      card_id: card_id,
    },
  }).then((res) => {
    theme_id = res.theme_id;
  });

  let card_title = 0;
  await Card.findOne({
    where: {
      card_id: card_id,
    },
  }).then((res) => {
    card_title = res.card_title;
  });

  if (createOrDelete == 0) {
    message = `您订阅的主题: ${theme_id} 新增了新的知识卡片: ${card_id}-${card_title}`;
  } else {
    message = `您订阅的主题: ${theme_id} 中的知识卡片: ${card_id} 被作者删除`;
  }

  const infomations = openids.map((openid) => ({ openid, message }));
  await Information.bulkCreate(infomations);
};

const sendComment = async (card_id) => {
  let openid = 0;
  let theme_id = 0;

  await ThemeCardConnection.findOne({
    where: {
      card_id: card_id,
    },
  }).then((res) => {
    theme_id = res.theme_id;
  });

  await Theme.findOne({
    where: {
      theme_id: theme_id,
    },
  }).then((res) => {
    openid = res.openid;
  });

  const message = `您的主题: ${theme_id} 的知识卡片: ${card_id} 下有新的评论`;
  const infomation = { openid, message };
  await Information.create(infomation);
};

export { sendThemeChange, sendCardChange, sendComment };
