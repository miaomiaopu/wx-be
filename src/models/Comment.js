import { DataTypes } from "sequelize";
import sequelize from "../configs/database.js";

const Comment = sequelize.define(
  "Comment",
  {
    comment_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
      comment: "评论唯一标识",
    },
    openid: {
      type: DataTypes.STRING(28),
      allowNull: false,
      comment: "用户唯一标识-外键",
    },
    card_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      comment: "卡片唯一标识-外键",
    },
    comment_content: {
      type: DataTypes.STRING(1024),
      allowNull: false,
      comment: "评论内容",
    },
    comment_date: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      allowNull: true,
      comment: "评论时间",
    },
  },
  {
    tableName: "comments",
    timestamps: false,
  }
);

export default Comment;
