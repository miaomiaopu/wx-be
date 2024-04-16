import { DataTypes } from "sequelize";
import sequelize from "../configs/database.js";

const CardPicture = sequelize.define(
  "CardPicture",
  {
    card_picture_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      primaryKey: true,
      allowNull: false,
      comment: "卡片内容图片唯一标识",
    },
    picture: {
      type: DataTypes.STRING(512),
      allowNull: false,
      comment: "卡片图片url",
    },
    card_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      primaryKey: true,
      allowNull: false,
      comment: "卡片唯一标识-外键",
    },
  },
  {
    tableName: "card_pictures",
    timestamps: false,
  }
);

export default CardPicture;
