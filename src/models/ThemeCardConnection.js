import { DataTypes } from "sequelize";
import sequelize from "../configs/database.js";

const ThemeCardConnection = sequelize.define(
  "ThemeCardConnection",
  {
    theme_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      comment: "主题唯一标识-外键",
    },
    card_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      comment: "卡片唯一标识-外键",
    },
  },
  {
    tableName: "theme_card_conn",
    timestamps: false, // 禁用自动添加 createdAt 和 updatedAt 字段
  }
);

export default ThemeCardConnection;
