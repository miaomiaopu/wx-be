import { DataTypes } from "sequelize";
import sequelize from "../configs/database.js";

const ThemeRanking = sequelize.define(
  "ThemeRanking",
  {
    theme_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      primaryKey: true,
      allowNull: false,
      comment: "主题唯一标识-外键",
    },
    theme_name: {
      type: DataTypes.STRING(128),
      allowNull: false,
      comment: "主题名称",
    },
    grade: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: "主题得分",
    },
  },
  {
    tableName: "theme_ranking",
    timestamps: false,
  }
);

export default ThemeRanking;
