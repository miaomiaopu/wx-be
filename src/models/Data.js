import { DataTypes } from "sequelize";
import sequelize from "../configs/database.js";

const Data = sequelize.define(
  "Data",
  {
    data_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
      comment: "用户数据唯一标识",
    },
    openid: {
      type: DataTypes.STRING(28),
      allowNull: false,
      comment: "用户唯一标识-外键",
    },
    today_study: {
      type: DataTypes.INTEGER.UNSIGNED,
      defaultValue: 0,
      allowNull: false,
      comment: "今日学习卡片数",
    },
    today_review: {
      type: DataTypes.INTEGER.UNSIGNED,
      defaultValue: 0,
      allowNull: false,
      comment: "今日复习卡片数",
    },
    today_duration: {
      type: DataTypes.INTEGER.UNSIGNED,
      defaultValue: 0,
      allowNull: false,
      comment: "今日学习时长/分钟",
    },
    total_learn: {
      type: DataTypes.INTEGER.UNSIGNED,
      defaultValue: 0,
      allowNull: false,
      comment: "累计学习卡片数",
    },
    total_duration: {
      type: DataTypes.INTEGER.UNSIGNED,
      defaultValue: 0,
      allowNull: false,
      comment: "累计学习时长/分钟",
    },
    total_check_ins: {
      type: DataTypes.INTEGER.UNSIGNED,
      defaultValue: 0,
      allowNull: false,
      comment: "累计签到天数",
    },
  },
  {
    tableName: "datas",
    timestamps: false, // 禁用自动添加 createdAt 和 updatedAt 字段
  }
);

export default Data;
