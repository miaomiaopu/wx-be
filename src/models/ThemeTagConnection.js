import { DataTypes } from "sequelize";
import sequelize from "../configs/database.js";

const ThemeTagConnection = sequelize.define(
  "ThemeTagConnection",
  {
    theme_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      primaryKey: true, // 将 theme_id 设置为主键之一
      comment: "主题唯一标识-外键",
    },
    tag_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      primaryKey: true, // 将 tag_id 设置为主键之一
      comment: "标签唯一标识-外键",
    },
  },
  {
    tableName: "theme_tag_conn",
    timestamps: false, // 禁用自动添加 createdAt 和 updatedAt 字段
  }
);

export default ThemeTagConnection;
