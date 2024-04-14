import { DataTypes } from "sequelize";
import sequelize from "../configs/database.js";

const CardStudyTime = sequelize.define(
  "CardStudyTime",
  {
    openid: {
      type: DataTypes.STRING(28),
      primaryKey: true,
      allowNull: false,
      comment: "用户唯一标识-外键",
    },
    card_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      primaryKey: true,
      allowNull: false,
      comment: "卡片唯一标识-外键",
    },
    last_study_time: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      allowNull: true,
      comment: "上次学习的时间",
    },
  },
  {
    tableName: "card_study_time",
    timestamps: false,
  }
);

export default CardStudyTime;
