import { DataTypes } from "sequelize";
import sequelize from "../configs/database.js";

const Theme = sequelize.define(
  "Theme",
  {
    theme_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
      comment: "主题唯一标识",
    },
    openid: {
      type: DataTypes.STRING(28),
      allowNull: false,
      comment: "用户唯一标识-外键",
    },
    theme_name: {
      type: DataTypes.STRING(128),
      allowNull: false,
      comment: "主题名称",
    },
    theme_picture: {
      type: DataTypes.STRING(512),
      allowNull: false,
      defaultValue: "http://localhost:8000/images/default-image.jpg",
      comment: "主题图片url",
    },
    total_subscription: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      defaultValue: 0,
      comment: "主题总订阅数",
    },
  },
  {
    tableName: "themes",
    timestamps: false,
  }
);

export default Theme;
