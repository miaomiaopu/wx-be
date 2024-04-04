import { DataTypes } from "sequelize";
import sequelize from "../configs/database.js";

const Checkin = sequelize.define(
  "Checkin",
  {
    check_ins_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
      comment: "签到日志唯一标识",
    },
    openid: {
      type: DataTypes.STRING(28),
      allowNull: false,
      comment: "用户唯一标识-外键",
    },
    check_date: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      allowNull: false,
      comment: "用户签到日期, 创建字段时自动创建",
    },
  },
  {
    tableName: "checkins",
    timestamps: false, // 禁用自动添加 createdAt 和 updatedAt 字段
  }
);

export default Checkin;
