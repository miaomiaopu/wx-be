import {
  Card,
  CardLikeConnection,
  CardPicture,
  CardStudyTime,
  Comment,
  ThemeCardConnection,
} from "../models/index.js";
import deleteImage from "./deleteImage.js";

const deleteByCardIds = async (cardIds) => {
  // 删除对应的数据
  await Promise.all([
    ThemeCardConnection.destroy({
      where: {
        card_id: cardIds,
      },
    }),
    Card.destroy({
      where: {
        card_id: cardIds,
      },
    }),
    CardStudyTime.destroy({
      where: {
        card_id: cardIds,
      },
    }),
    CardLikeConnection.destroy({
      where: {
        card_id: cardIds,
      },
    }),
    Comment.destroy({
      where: {
        card_id: cardIds,
      },
    }),
  ]);

  // 获取并且删除图片
  let imageUrls = [];
  await CardPicture.findAll({
    where: {
      card_id: cardIds,
    },
  }).then((result) => {
    imageUrls = result.map((connection) => connection.picture);
  });

  for (const imageUrl of imageUrls) {
    deleteImage(imageUrl);
  }

  await CardPicture.destroy({
    where: {
      card_id: cardIds,
    },
  });
};

const deleteByCardId = async (cardId) => {
  let cardIds = [];
  cardIds.push(cardId);
  await deleteByCardIds(cardIds);
};

export { deleteByCardIds, deleteByCardId };
