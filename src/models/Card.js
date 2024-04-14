import { DataTypes } from "sequelize";
import sequelize from "../configs/database.js";

const Card = sequelize.define(
  "Card",
  {
    card_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
      comment: "卡片唯一标识",
    },
    theme_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      comment: "主题唯一标识-外键",
    },
    card_title: {
      type: DataTypes.STRING(128),
      allowNull: false,
      comment: "卡片标题",
    },
    card_content: {
      type: DataTypes.STRING(1024),
      allowNull: false,
      comment: "卡片内容",
    },
    total_likes: {
      type: DataTypes.INTEGER.UNSIGNED,
      defaultValue: 0,
      allowNull: false,
      comment: "卡片点赞总数",
    },
    card_modified_date: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      allowNull: true,
      comment: "卡片修改时间",
    },
  },
  {
    tableName: "cards",
    timestamps: false,
  }
);

export default Card;
